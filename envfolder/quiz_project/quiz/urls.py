from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet,
    QuizViewSet,
    QuestionViewSet,
    QuizAttemptViewSet,
    StreakView,
    LeaderboardView
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'quizzes', QuizViewSet, basename='quiz')
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'attempts', QuizAttemptViewSet, basename='attempt')

urlpatterns = [
    # Router-based endpoints (CRUD)
    path('', include(router.urls)),
    
    # Custom endpoints
    path('streak/', StreakView.as_view(), name='streak-stats'),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
]