from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Sum
from django.utils import timezone
from .models import Product, Inventory, Order, OrderItem
from .serializers import ProductSerializer, InventorySerializer, OrderSerializer
from rest_framework.permissions import IsAuthenticated
from user.permissions import IsAdminOrStaff, IsAdminOrStaffOrReadOnly

# --- PRODUCT VIEWS ---
class ProductListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminOrStaffOrReadOnly]
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def perform_create(self, serializer):
        # Extract the initial_stock from the validated data
        initial_stock = serializer.validated_data.pop('initial_stock', 0)
        
        # Save the product
        product = serializer.save()
        
        # Create the inventory record with the stock you entered in the UI
        Inventory.objects.create(product=product, quantity_available=initial_stock)

class ProductRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminOrStaffOrReadOnly]
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

# --- INVENTORY VIEWS ---
class InventoryListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminOrStaffOrReadOnly]
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer

# This view handles the individual stock updates (PATCH)
class InventoryRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminOrStaffOrReadOnly]
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer

# --- ORDER VIEWS ---
class OrderListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminOrStaffOrReadOnly]
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

# views.py
class OrderRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminOrStaffOrReadOnly]
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Safety Check: Only allow deletion if the order hasn't been shipped yet
        if instance.status == 'SHIPPED':
            return Response(
                {'error': 'COMMAND_DENIED: Cannot delete a finalized shipment.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)

# --- CUSTOM FULFILLMENT LOGIC ---
class OrderFulfillView(APIView):
    permission_classes = [IsAdminOrStaff]
    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        if order.status == 'SHIPPED':
            return Response({'error': 'Order already shipped'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            # Get the items related to this order
            items = OrderItem.objects.filter(order=order)
            
            for item in items:
                # Check if inventory exists for this product
                try:
                    inventory = Inventory.objects.select_for_update().get(product=item.product)
                except Inventory.DoesNotExist:
                    return Response({'error': f'No inventory record for {item.product.name}'}, status=status.HTTP_400_BAD_REQUEST)

                if inventory.quantity_available < item.quantity:
                    return Response({'error': f'Low stock for {item.product.name}'}, status=status.HTTP_400_BAD_REQUEST)
                
                inventory.quantity_available -= item.quantity
                inventory.save()

            order.status = 'SHIPPED' 
            order.shipped_at = timezone.now()
            order.save()
            
        return Response({'status': 'Stock deducted and order shipped.'})
    
# --- ANALYTICS VIEW ---
class FulfillmentReportView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        report = {
            "total_orders": Order.objects.count(),
            "shipped_orders": Order.objects.filter(status='SHIPPED').count(),
            "low_stock_items": Inventory.objects.filter(quantity_available__lt=10).count(),
            # Returns top 5 selling items
            "top_selling_products": list(OrderItem.objects.values('product__name')
                                    .annotate(total_sold=Sum('quantity'))
                                    .order_by('-total_sold')[:5])
        }
        return Response(report)

# --- CHATBOT VIEW ---
class ChatbotView(APIView):
    # Publicly or authenticated access - let's require authentication to enforce RBAC & Security!
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message = request.data.get('message', '').strip().lower()
        if not message:
            return Response({'reply': "SYSTEM_ERROR: Command string is empty. Please enter a request."})

        # 1. Report/Summary Query
        if any(x in message for x in ['summary', 'report', 'health', 'status update', 'metrics']):
            total_orders = Order.objects.count()
            shipped_orders = Order.objects.filter(status='SHIPPED').count()
            low_stock = Inventory.objects.filter(quantity_available__lt=10).count()
            return Response({
                'reply': f"🤖 [SYSTEM_METRICS_LOG]\n• Total Registered Orders: {total_orders}\n• Flipped/Shipped Orders: {shipped_orders}\n• SKUs in Low Stock Alert (< 10 units): {low_stock}\n• System Integrity: NOMINAL.\nIs there a specific SKU or order you would like to audit?"
            })

        # 2. Specific SKU Stock Query (e.g., "stock of item" or "stock sku-0001")
        if 'stock' in message:
            # Try to extract the product name or sku
            products = Product.objects.all()
            found_prod = None
            for p in products:
                if p.name.lower() in message or p.sku.lower() in message:
                    found_prod = p
                    break
            
            if found_prod:
                try:
                    inv = Inventory.objects.get(product=found_prod)
                    qty = inv.quantity_available
                    status_lbl = "OK" if qty >= 10 else "LOW_STOCK_WARNING"
                    return Response({
                        'reply': f"🤖 [AUDIT_INVENTORY_MATCH]\n• Product: {found_prod.name} ({found_prod.sku})\n• Available Stock: {qty} units\n• Health Status: {status_lbl}\nIs there anything else I can index for you?"
                    })
                except Inventory.DoesNotExist:
                    return Response({
                        'reply': f"🤖 [DATABASE_INTEGRITY_ALERT] Product '{found_prod.name}' exists, but no inventory log is linked to it."
                    })
            else:
                # Return list of low stock items if they just say "stock"
                low_skus = Inventory.objects.filter(quantity_available__lt=10)
                if low_skus.exists():
                    items_str = "\n".join([f"• {i.product.name}: {i.quantity_available} units" for i in low_skus])
                    return Response({
                        'reply': f"🤖 [LOW_STOCK_AUDIT]\nThe following items currently have low stock:\n{items_str}"
                    })
                return Response({
                    'reply': "🤖 [INVENTORY_AUDIT] Please specify the product name or SKU code (e.g., 'What is the stock of [Product Name]?')."
                })

        # 3. Order Status Query (e.g., "order #1" or "status of order 2")
        if 'order' in message:
            import re
            # Extract number
            numbers = re.findall(r'\d+', message)
            if numbers:
                order_id = int(numbers[0])
                try:
                    order = Order.objects.get(id=order_id)
                    items = order.items.all()
                    items_str = ", ".join([f"{item.quantity}x {item.product.name}" for item in items])
                    return Response({
                        'reply': f"🤖 [TRACK_ORDER_RESOLVED]\n• Order ID: #{order.id}\n• Customer: {order.customer_name}\n• Current Status: {order.status}\n• Items: {items_str or 'No items registered'}\n• Timestamp: {order.order_date.strftime('%Y-%m-%d %H:%M:%S UTC')}"
                    })
                except Order.DoesNotExist:
                    return Response({
                        'reply': f"🤖 [DATABASE_RESOLVE_FAIL] No order registered under ID #{order_id}."
                    })
            return Response({
                'reply': "🤖 [ORDER_TRACKING] Please specify the Order ID code (e.g., 'What is the status of Order #1?')."
            })

        # 4. Help / Welcome
        if any(x in message for x in ['help', 'hello', 'hi', 'hey', 'commands', 'menu']):
            username = request.user.username
            return Response({
                'reply': f"🤖 [WEREHAUS_INTELLIGENCE_ONLINE]\nGreetings, Operator **{username}**!\nI am your automated inventory assistant. I have live access to the database. Try asking me:\n\n1. `Show me a summary/report` (Overall metrics)\n2. `What is the stock of [Product Name]?` (SKU audit)\n3. `What is the status of Order #[ID]?` (Order tracking)\n\nSystem diagnostics: Connection: SECURE | DB: SYNCED."
            })

        # Default Fallback
        return Response({
            'reply': f"🤖 [COMMAND_UNRESOLVED]\n'*{message}*' is not indexed in my core subroutines. Type `help` to list supported system diagnostics."
        })