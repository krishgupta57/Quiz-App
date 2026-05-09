import random
import requests
import html
from rest_framework import status, permissions, viewsets, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Category, Quiz, Question, Choice, QuizAttempt, UserAnswer, UserStats
from .serializers import (
    CategorySerializer, 
    QuizSerializer, 
    QuestionSerializer, 
    QuizAttemptSerializer
)

# --- BASE VIEWSETS ---

class CategoryViewSet(viewsets.ModelViewSet):
    """
    Handles Category CRUD operations.
    - GET: List all categories
    - POST: Create category (Admin)
    - DELETE: Remove category (Admin)
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class QuizViewSet(viewsets.ModelViewSet):
    """
    Handles Quiz CRUD operations.
    - GET: List all quizzes (optionally filtered by category)
    - POST: Create quiz (Admin)
    - DELETE: Remove quiz (Admin)
    """
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        category_id = self.request.query_params.get('category_id')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset

    def retrieve(self, request, *args, **kwargs):
        """Custom retrieve to include questions for the quiz session."""
        instance = self.get_object()
        questions = instance.questions.all()
        q_serializer = QuestionSerializer(questions, many=True)
        quiz_serializer = self.get_serializer(instance)
        return Response({
            "quiz": quiz_serializer.data,
            "questions": q_serializer.data
        })

class QuestionViewSet(viewsets.ModelViewSet):
    """
    Handles Question CRUD operations (Admin).
    Includes logic for bulk creating choices.
    """
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data
        quiz_id = data.get('quiz_id')
        quiz = get_object_or_404(Quiz, id=quiz_id)
        
        question = Question.objects.create(
            quiz=quiz,
            text=data['text'],
            difficulty=data.get('difficulty', 'Medium')
        )
        
        for choice_data in data.get('choices', []):
            Choice.objects.create(
                question=question,
                text=choice_data['text'],
                is_correct=choice_data['is_correct']
            )
        
        serializer = self.get_serializer(question)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class QuizAttemptViewSet(mixins.ListModelMixin,
                         mixins.RetrieveModelMixin,
                         viewsets.GenericViewSet):
    """
    Handles listing results and submitting quiz attempts.
    """
    queryset = QuizAttempt.objects.all()
    serializer_class = QuizAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter attempts by current user unless staff."""
        if self.request.user.is_staff:
            return QuizAttempt.objects.all()
        return QuizAttempt.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'], url_path='submit')
    def submit(self, request):
        """Main logic for grading a quiz submission."""
        data = request.data
        quiz_id = data.get('quiz_id')
        answers = data.get('answers', {}) # format: {"question_id": "choice_id"}
        
        quiz = get_object_or_404(Quiz, id=quiz_id)
        score = 0
        total = quiz.questions.count()
        
        attempt = QuizAttempt.objects.create(
            user=request.user,
            quiz=quiz,
            score=0,
            total=total
        )

        for q_id_str, c_id in answers.items():
            try:
                question = Question.objects.get(id=int(q_id_str), quiz=quiz)
                choice = Choice.objects.get(id=c_id, question=question)
                
                UserAnswer.objects.create(
                    user=request.user,
                    quiz_attempt=attempt,
                    question=question,
                    selected_choice=choice
                )
                
                if choice.is_correct:
                    score += 1
            except (Question.DoesNotExist, Choice.DoesNotExist, ValueError):
                continue
                
        attempt.score = score
        attempt.save()
        
        return Response(self.get_serializer(attempt).data, status=status.HTTP_201_CREATED)

# --- WORLD TRIVIA (STREAK MODE) ---

class StreakView(APIView):
    """
    Handles logic for the World Trivia (Streak) mode.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Fetch a random question from OpenTDB."""
        try:
            res = requests.get('https://opentdb.com/api.php?amount=1&type=multiple', timeout=7)
            data = res.json()
            if data['response_code'] == 0:
                result = data['results'][0]
                choices = [{"id": random.randint(1000, 9999), "text": html.unescape(result['correct_answer']), "is_correct": True}]
                for inc in result['incorrect_answers']:
                    choices.append({"id": random.randint(1000, 9999), "text": html.unescape(inc), "is_correct": False})
                random.shuffle(choices)
                
                return Response({
                    "id": random.randint(1000, 9999),
                    "text": html.unescape(result['question']),
                    "choices": choices,
                    "category": result['category'],
                    "difficulty": result['difficulty']
                })
            return Response({"error": "Trivia service busy"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception:
            return Response({"error": "Connection error"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    def post(self, request):
        """Update or get streak stats."""
        stats, _ = UserStats.objects.get_or_create(user=request.user)
        current_streak = request.data.get('streak', 0)
        
        new_record = False
        if current_streak > stats.max_streak:
            stats.max_streak = current_streak
            stats.save()
            new_record = True
            
        return Response({"max_streak": stats.max_streak, "new_record": new_record})

class LeaderboardView(APIView):
    """
    Returns the top streak performers.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        stats = UserStats.objects.all().order_by('-max_streak')[:20]
        data = [{"username": s.user.username, "max_streak": s.max_streak, "last_played": s.last_played.strftime("%Y-%m-%d %H:%M")} for s in stats]
        return Response(data)