# urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Products
    path('products/', views.ProductListCreateView.as_view()),
    path('products/<int:pk>/', views.ProductRetrieveUpdateDestroyView.as_view()),
    
    # Inventory
    path('inventory/', views.InventoryListCreateView.as_view()),
    path('inventory/<int:pk>/', views.InventoryRetrieveUpdateDestroyView.as_view()),
    
    # Orders
    path('orders/', views.OrderListCreateView.as_view()),
    path('orders/<int:pk>/', views.OrderRetrieveUpdateDestroyView.as_view()),
    
    # The Fulfillment Action
    path('orders/<int:pk>/fulfill/', views.OrderFulfillView.as_view()),
    
    # The Analytics/Dashboard Data
    path('reports/dashboard/', views.FulfillmentReportView.as_view()),
]