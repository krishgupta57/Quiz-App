from django.urls import path
from .views import (
    question_list_api, 
    quiz_submit_api, 
    admin_attempts_api, 
    admin_questions_api, 
    admin_question_detail_api
)

urlpatterns = [
    path('questions/', question_list_api, name='api-questions'),
    path('submit/', quiz_submit_api, name='api-submit'),
    path('admin/attempts/', admin_attempts_api, name='api-attempts'),
    path('admin/questions/', admin_questions_api, name='api-questions-create'),
    path('admin/questions/<int:pk>/', admin_question_detail_api, name='api-question-detail'),
]