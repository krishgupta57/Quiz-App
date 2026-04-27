from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth.models import User
from .serializers import UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@csrf_exempt
def signup_api(request):
    data = request.data
    is_admin_registration = data.get('is_admin', False)
    secret_key = data.get('secret_key', '')

    # Admin Registration Logic
    if is_admin_registration:
        expected_key = os.getenv('ADMIN_SECRET_KEY', 'ADMIN123')
        if secret_key != expected_key:
            return Response({"error": "Invalid Admin Secret Key"}, status=status.HTTP_403_FORBIDDEN)

    serializer = UserSerializer(data=data)
    if serializer.is_valid():
        user = serializer.save()
        
        # If admin registration was successful, set staff flag
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

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
@csrf_exempt
def me_api(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
@csrf_exempt
def user_list_api(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([permissions.IsAdminUser])
@csrf_exempt
def user_detail_api(request, pk):
    try:
        user = User.objects.get(pk=pk)
        if user.is_staff:
            return Response({"error": "Cannot delete staff member"}, status=status.HTTP_400_BAD_REQUEST)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)