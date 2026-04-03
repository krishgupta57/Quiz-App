from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({"error": "Username and password are required."}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({"error": "User already exists."}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, password=password)
    
    # Generate tokens for the new user
    refresh = RefreshToken.for_user(user)

    return Response({
        "message": "User created successfully.",
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """Returns basic information about the authenticated user."""
    return Response({
        "id": request.user.id,
        "username": request.user.username,
        "is_staff": request.user.is_staff,
        "is_superuser": request.user.is_superuser
    })

@api_view(['GET', 'DELETE'])
@permission_classes([IsAdminUser])
def user_management(request, user_id=None):
    """List all regular users, or delete a specific user by ID."""
    if request.method == 'GET':
        # Don't list superusers or staff in the general user management typically, 
        # or just list everyone for the admin.
        users = User.objects.all().values('id', 'username', 'is_staff', 'date_joined')
        return Response(list(users))
        
    elif request.method == 'DELETE':
        if not user_id:
            return Response({"error": "User ID required for deletion."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user_to_delete = User.objects.get(id=user_id)
            if user_to_delete.is_superuser:
                return Response({"error": "Cannot delete a superuser."}, status=status.HTTP_403_FORBIDDEN)
            
            user_to_delete.delete()
            return Response({"message": "User deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)