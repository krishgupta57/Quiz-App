from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import Question, Choice, UserAnswer, QuizAttempt

@login_required
def quiz_view(request):
    questions = Question.objects.all()

    if request.method == "POST":
        score = 0
        total = questions.count()

        for question in questions:
            selected = request.POST.get(str(question.id))

            if selected:
                choice = Choice.objects.get(id=selected)

                UserAnswer.objects.create(
                    user=request.user,
                    question=question,
                    selected_choice=choice
                )

                if choice.is_correct:
                    score += 1

        QuizAttempt.objects.create(
            user=request.user,
            score=score,
            total=total
        )

        return render(request, "quiz/result.html", {
            "score": score,
            "total": total
        })

    return render(request, "quiz/quiz.html", {"questions": questions})