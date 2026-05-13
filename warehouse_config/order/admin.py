from django.contrib import admin
from .models import Product, Inventory, Order, OrderItem
from django.contrib.auth import get_user_model

User = get_user_model()

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer_name', 'status', 'order_date')
    list_filter = ('status', 'order_date')
    search_fields = ('customer_name',)
    inlines = [OrderItemInline]

@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ('product', 'quantity_available', 'last_updated')
    list_editable = ('quantity_available',)

admin.site.register(Product)
admin.site.register(User)