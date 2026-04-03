from django.urls import path
from .views import question_list, submit_quiz, admin_questions, admin_attempts

urlpatterns = [
    path('questions/', question_list, name='question_list'),
    path('submit/', submit_quiz, name='submit_quiz'),
    path('admin/questions/', admin_questions, name='admin_questions_create'),
    path('admin/questions/<int:question_id>/', admin_questions, name='admin_questions_delete'),
    path('admin/attempts/', admin_attempts, name='admin_attempts'),
]