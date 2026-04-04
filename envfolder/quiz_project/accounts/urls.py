from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import signup_api, me_api, user_list_api, user_detail_api

urlpatterns = [
    # API endpoints (used by React)
    path('signup/', signup_api, name='api-signup'),
    path('login/', TokenObtainPairView.as_view(), name='api-login'),
    path('refresh/', TokenRefreshView.as_view(), name='api-refresh'),
    path('me/', me_api, name='api-me'),
    path('users/', user_list_api, name='user-list'),
    path('users/<int:pk>/', user_detail_api, name='user-detail'),
]