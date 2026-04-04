from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Question, Choice, QuizAttempt, UserAnswer
from .serializers import QuestionSerializer, QuizAttemptSerializer
from django.views.decorators.csrf import csrf_exempt

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
@csrf_exempt
def question_list_api(request):
    questions = Question.objects.all()
    serializer = QuestionSerializer(questions, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@csrf_exempt
def quiz_submit_api(request):
    answers = request.data
    score = 0
    total = Question.objects.count()

    for question_id, choice_id in answers.items():
        try:
            question = Question.objects.get(id=question_id)
            choice = Choice.objects.get(id=choice_id)

            UserAnswer.objects.create(
                user=request.user,
                question=question,
                selected_choice=choice
            )

            if choice.is_correct:
                score += 1

        except (Question.DoesNotExist, Choice.DoesNotExist, ValueError):
            continue
    
    QuizAttempt.objects.create(
        user=request.user,
        score=score,
        total=total
    )

    return Response({
        "score": score,
        "total": total
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
@csrf_exempt
def admin_attempts_api(request):
    attempts = QuizAttempt.objects.all().order_by('-created_at')
    serializer = QuizAttemptSerializer(attempts, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
@csrf_exempt
def admin_questions_api(request):
    # payload: { text, choices: [{ text, is_correct }, ...] }
    data = request.data
    question = Question.objects.create(text=data['text'])
    
    for choice_data in data['choices']:
        Choice.objects.create(
            question=question,
            text=choice_data['text'],
            is_correct=choice_data['is_correct']
        )
    
    return Response(QuestionSerializer(question).data, status=status.HTTP_201_CREATED)

@api_view(['DELETE'])
@permission_classes([permissions.IsAdminUser])
@csrf_exempt
def admin_question_detail_api(request, pk):
    try:
        question = Question.objects.get(pk=pk)
        question.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Question.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)