from rest_framework import serializers
from .models import Product, Inventory, Order, OrderItem

# serializers.py
class ProductSerializer(serializers.ModelSerializer):
    initial_stock = serializers.IntegerField(write_only=True, required=False, default=0)

    class Meta:
        model = Product
        fields = ['id', 'name', 'sku', 'price', 'description', 'initial_stock']

class InventorySerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    class Meta:
        model = Inventory
        fields = ['id', 'product', 'product_name', 'quantity_available', 'last_updated']
        # THE FIX: Allows PATCH updates to quantity without sending product ID again
        extra_kwargs = {
            'product': {'read_only': True}
        }

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, required=False) 

    class Meta:
        model = Order
        fields = ['id', 'customer_name', 'status', 'order_date', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        order = Order.objects.create(**validated_data)
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        return order