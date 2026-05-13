from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # 1. JWT Authentication Endpoints (For Login)
    # Your React app will POST to /user/api/token/ to log in
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # 2. Djoser Endpoints (For Registration and Profile)
    # This includes /user/auth/users/me/ to get the profile details
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
]