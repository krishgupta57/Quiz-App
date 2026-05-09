from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import SignupView, MeView, UserViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    # Auth endpoints
    path('signup/', SignupView.as_view(), name='api-signup'),
    path('login/', TokenObtainPairView.as_view(), name='api-login'),
    path('refresh/', TokenRefreshView.as_view(), name='api-refresh'),
    path('me/', MeView.as_view(), name='api-me'),
    
    # User management (Admin)
    path('', include(router.urls)),
]