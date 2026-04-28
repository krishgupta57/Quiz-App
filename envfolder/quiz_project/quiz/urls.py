from django.urls import path
from .views import (
    category_list_api,
    quiz_list_api,
    quiz_detail_api,
    submit_quiz_api,
    user_results_api,
    random_question_api,
    streak_stats_api,
    admin_leaderboard_api,
    admin_attempts_api,
    admin_category_api,
    admin_category_detail_api,
    admin_quiz_api,
    admin_quiz_detail_api,
    admin_questions_api,
    admin_question_detail_api
)

urlpatterns = [
    # Student Routes
    path('categories/', category_list_api, name='api-categories'),
    path('categories/<int:category_id>/quizzes/', quiz_list_api, name='api-category-quizzes'),
    path('quiz/<int:quiz_id>/', quiz_detail_api, name='api-quiz-detail'),
    path('submit-quiz/', submit_quiz_api, name='api-submit-quiz'),
    path('results/', user_results_api, name='api-user-results'),
    
    # World Trivia Routes
    path('random/', random_question_api, name='api-random-question'),
    path('streak-stats/', streak_stats_api, name='api-streak-stats'),
    
    # Admin Routes
    path('admin/categories/', admin_category_api, name='api-admin-categories'),
    path('admin/categories/<int:pk>/', admin_category_detail_api, name='api-admin-categories-detail'),
    path('admin/quizzes/', admin_quiz_api, name='api-admin-quizzes'),
    path('admin/quizzes/<int:pk>/', admin_quiz_detail_api, name='api-admin-quizzes-detail'),
    path('admin/questions/', admin_questions_api, name='api-admin-questions'),
    path('admin/questions/<int:pk>/', admin_question_detail_api, name='api-admin-questions-detail'),
    path('admin/attempts/', admin_attempts_api, name='api-admin-attempts'),
    path('admin/leaderboard/', admin_leaderboard_api, name='api-admin-leaderboard'),
]