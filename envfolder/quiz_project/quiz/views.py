from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Category, Quiz, Question, Choice, QuizAttempt, UserAnswer, UserStats
from .serializers import CategorySerializer, QuizSerializer, QuestionSerializer, QuizAttemptSerializer
from django.views.decorators.csrf import csrf_exempt
import random
import requests
import html

# --- STUDENT APIs ---

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def category_list_api(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def quiz_list_api(request, category_id):
    quizzes = Quiz.objects.filter(category_id=category_id)
    serializer = QuizSerializer(quizzes, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def quiz_detail_api(request, quiz_id):
    try:
        quiz = Quiz.objects.get(id=quiz_id)
        questions = quiz.questions.all()
        q_serializer = QuestionSerializer(questions, many=True)
        quiz_serializer = QuizSerializer(quiz)
        return Response({
            "quiz": quiz_serializer.data,
            "questions": q_serializer.data
        })
    except Quiz.DoesNotExist:
        return Response({"error": "Quiz not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@csrf_exempt
def submit_quiz_api(request):
    data = request.data
    quiz_id = data.get('quiz_id')
    answers = data.get('answers', {}) # format: {"question_id": "choice_id"}
    
    try:
        quiz = Quiz.objects.get(id=quiz_id)
    except Quiz.DoesNotExist:
        return Response({"error": "Quiz not found"}, status=status.HTTP_404_NOT_FOUND)

    score = 0
    total = quiz.questions.count()
    
    attempt = QuizAttempt.objects.create(
        user=request.user,
        quiz=quiz,
        score=0, # Will update
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
    attempt.save() # This triggers percentage calculation
    
    return Response(QuizAttemptSerializer(attempt).data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_results_api(request):
    attempts = QuizAttempt.objects.filter(user=request.user).order_by('-created_at')
    serializer = QuizAttemptSerializer(attempts, many=True)
    return Response(serializer.data)


# --- WORLD TRIVIA (STREAK MODE) APIs ---

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def random_question_api(request):
    try:
        response = requests.get('https://opentdb.com/api.php?amount=1&type=multiple', timeout=7)
        data = response.json()
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
        else:
            return Response({"error": "World Trivia is busy. Try again in a second!"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception as e:
        return Response({"error": "Check your internet connection for World Trivia"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

@api_view(['POST', 'GET'])
@permission_classes([permissions.IsAuthenticated])
def streak_stats_api(request):
    stats, created = UserStats.objects.get_or_create(user=request.user)
    if request.method == 'POST':
        current_streak = request.data.get('streak', 0)
        if current_streak > stats.max_streak:
            stats.max_streak = current_streak
            stats.save()
            return Response({"max_streak": stats.max_streak, "new_record": True})
        return Response({"max_streak": stats.max_streak, "new_record": False})
    return Response({"max_streak": stats.max_streak})

# --- ADMIN APIs ---

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated]) # Keeping IsAuthenticated for testing as per earlier request
def admin_leaderboard_api(request):
    stats = UserStats.objects.all().order_by('-max_streak')
    data = []
    for s in stats:
        data.append({"username": s.user.username, "max_streak": s.max_streak, "last_played": s.last_played.strftime("%Y-%m-%d %H:%M")})
    return Response(data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
@csrf_exempt
def admin_attempts_api(request):
    attempts = QuizAttempt.objects.all().order_by('-created_at')
    serializer = QuizAttemptSerializer(attempts, many=True)
    return Response(serializer.data)

@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
@csrf_exempt
def admin_category_api(request):
    if request.method == 'POST':
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    categories = Category.objects.all()
    return Response(CategorySerializer(categories, many=True).data)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
@csrf_exempt
def admin_category_detail_api(request, pk):
    try:
        category = Category.objects.get(pk=pk)
        category.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Category.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
@csrf_exempt
def admin_quiz_api(request):
    if request.method == 'POST':
        serializer = QuizSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    quizzes = Quiz.objects.all()
    return Response(QuizSerializer(quizzes, many=True).data)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
@csrf_exempt
def admin_quiz_detail_api(request, pk):
    try:
        quiz = Quiz.objects.get(pk=pk)
        quiz.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Quiz.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@csrf_exempt
def admin_questions_api(request):
    data = request.data
    quiz_id = data.get('quiz_id')
    try:
        quiz = Quiz.objects.get(id=quiz_id)
        question = Question.objects.create(
            quiz=quiz,
            text=data['text'],
            difficulty=data.get('difficulty', 'Medium')
        )
        for choice_data in data['choices']:
            Choice.objects.create(
                question=question,
                text=choice_data['text'],
                is_correct=choice_data['is_correct']
            )
        return Response(QuestionSerializer(question).data, status=status.HTTP_201_CREATED)
    except Quiz.DoesNotExist:
        return Response({"error": "Quiz not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
@csrf_exempt
def admin_question_detail_api(request, pk):
    try:
        question = Question.objects.get(pk=pk)
        question.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Question.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)