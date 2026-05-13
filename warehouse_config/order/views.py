from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Sum
from .models import Product, Inventory, Order, OrderItem
from .serializers import ProductSerializer, InventorySerializer, OrderSerializer

# --- PRODUCT VIEWS ---
class ProductListCreateView(generics.ListCreateAPIView):
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
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

# --- INVENTORY VIEWS ---
class InventoryListCreateView(generics.ListCreateAPIView):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer

# This view handles the individual stock updates (PATCH)
class InventoryRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer

# --- ORDER VIEWS ---
class OrderListCreateView(generics.ListCreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

# views.py
class OrderRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
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
            order.save()
            
        return Response({'status': 'Stock deducted and order shipped.'})
    
# --- ANALYTICS VIEW ---
class FulfillmentReportView(APIView):
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