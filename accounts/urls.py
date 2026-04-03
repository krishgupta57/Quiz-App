from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import signup_view, current_user, user_management

urlpatterns = [
    path('signup/', signup_view, name='signup'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', current_user, name='current_user'),
    path('users/', user_management, name='users_list'),
    path('users/<int:user_id>/', user_management, name='user_delete'),
]