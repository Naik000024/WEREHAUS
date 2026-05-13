from djoser.serializers import UserCreateSerializer as DjoserUserCreateSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

# This handles User Registration (POST)
class UserCreateSerializer(DjoserUserCreateSerializer):
    class Meta(DjoserUserCreateSerializer.Meta):
        model = User
        fields = (
            'id', 
            'email', 
            'username', 
            'first_name', 
            'last_name', 
            'password', 
            'address', 
            'age', 
            'birthday'
        )

# This handles User Profile viewing/updates (GET/PUT)
# Djoser uses this for the /users/me/ endpoint
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id', 
            'email', 
            'username', 
            'first_name', 
            'last_name', 
            'address', 
            'age', 
            'birthday'
        )