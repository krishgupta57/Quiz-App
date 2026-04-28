from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    icon_name = models.CharField(max_length=50, blank=True, null=True) # e.g., 'Code', 'Database', 'Globe'

    def __str__(self):
        return self.name

class Quiz(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='quizzes')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    time_limit_minutes = models.IntegerField(default=10)

    def __str__(self):
        return self.title

class Question(models.Model):
    DIFFICULTY_CHOICES = (
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard'),
    )
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions', null=True, blank=True)
    text = models.CharField(max_length=500)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='Medium')

    def __str__(self):
        return self.text

class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="choices")
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.text

class QuizAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, null=True, blank=True)
    score = models.IntegerField()
    total = models.IntegerField()
    percentage = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.total > 0:
            self.percentage = round((self.score / self.total) * 100, 2)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.quiz.title if self.quiz else 'Streak'} - {self.score}/{self.total}"

class UserAnswer(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    quiz_attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name="answers", null=True, blank=True)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_choice = models.ForeignKey(Choice, on_delete=models.CASCADE)

class UserStats(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="stats")
    max_streak = models.IntegerField(default=0)
    last_played = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - Max Streak: {self.max_streak}"