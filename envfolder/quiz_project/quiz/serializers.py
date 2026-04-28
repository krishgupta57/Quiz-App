from rest_framework import serializers
from .models import Category, Quiz, Question, Choice, QuizAttempt

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class QuizSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    question_count = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'time_limit_minutes', 'category', 'category_name', 'question_count']

    def get_question_count(self, obj):
        return obj.questions.count()

class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ('id', 'text', 'is_correct')

class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ('id', 'text', 'difficulty', 'choices')

class QuizAttemptSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    quiz_title = serializers.CharField(source='quiz.title', read_only=True, default='Streak Mode')
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)

    class Meta:
        model = QuizAttempt
        fields = ('id', 'username', 'quiz_title', 'score', 'total', 'percentage', 'created_at')
