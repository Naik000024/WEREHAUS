from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('order.urls')), # This connects your order app to the API
    path('user/', include('user.urls')),
]