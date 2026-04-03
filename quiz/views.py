from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from .models import Question, Choice, UserAnswer, QuizAttempt
from .serializers import QuestionSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def question_list(request):
    questions = Question.objects.all()
    serializer = QuestionSerializer(questions, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_quiz(request):
    """
    Expects request.data to be a dictionary mapping question IDs to choice IDs.
    Example: {"1": "3", "2": "5"}
    """
    answers = request.data
    questions = Question.objects.all()
    total = questions.count()
    score = 0

    for question in questions:
        selected_id = answers.get(str(question.id))
        
        if selected_id:
            try:
                choice = Choice.objects.get(id=selected_id, question=question)
                # Save user answer
                UserAnswer.objects.create(
                    user=request.user,
                    question=question,
                    selected_choice=choice
                )
                
                if choice.is_correct:
                    score += 1
            except Choice.DoesNotExist:
                pass
                
    attempt = QuizAttempt.objects.create(
        user=request.user,
        score=score,
        total=total
    )

    return Response({
        "score": attempt.score,
        "total": attempt.total,
        "message": "Quiz submitted successfully."
    }, status=status.HTTP_200_OK)

@api_view(['POST', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_questions(request, question_id=None):
    if request.method == 'POST':
        question_text = request.data.get('text')
        choices_data = request.data.get('choices', [])
        
        if not question_text or not choices_data:
            return Response({"error": "Question text and choices are required."}, status=status.HTTP_400_BAD_REQUEST)
            
        question = Question.objects.create(text=question_text)
        
        for choice in choices_data:
            Choice.objects.create(
                question=question,
                text=choice.get('text'),
                is_correct=choice.get('is_correct', False)
            )
            
        return Response({"message": "Question created successfully.", "id": question.id}, status=status.HTTP_201_CREATED)
        
    elif request.method == 'DELETE':
        if not question_id:
            return Response({"error": "Question ID required."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            Question.objects.get(id=question_id).delete()
            return Response({"message": "Question deleted."}, status=status.HTTP_204_NO_CONTENT)
        except Question.DoesNotExist:
            return Response({"error": "Question not found."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_attempts(request):
    attempts = QuizAttempt.objects.select_related('user').order_by('-created_at')
    data = []
    for att in attempts:
        data.append({
            "id": att.id,
            "username": att.user.username,
            "score": att.score,
            "total": att.total,
            "created_at": att.created_at.strftime('%Y-%m-%d %H:%M:%S')
        })
    return Response(data)
