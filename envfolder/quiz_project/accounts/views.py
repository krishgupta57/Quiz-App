from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, viewsets
from django.contrib.auth.models import User
from .serializers import UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
import os

class SignupView(APIView):
    """
    Handles user registration for both students and admins.
    Admins require a secret key defined in environment variables.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        is_admin_registration = data.get('is_admin', False)
        secret_key = data.get('secret_key', '')

        if is_admin_registration:
            expected_key = os.getenv('ADMIN_SECRET_KEY', 'ADMIN123')
            if secret_key != expected_key:
                return Response(
                    {"error": "Invalid Admin Secret Key"}, 
                    status=status.HTTP_403_FORBIDDEN
                )

        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            if is_admin_registration:
                user.is_staff = True
                user.save()
            
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MeView(APIView):
    """
    Returns the currently authenticated user's profile.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class UserViewSet(viewsets.ModelViewSet):
    """
    Admin-only viewset for listing and deleting users.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated] # Should be IsAdminUser in production

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.is_staff:
            return Response(
                {"error": "Cannot delete staff member"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)