import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Clock, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const QuizSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: choiceId }
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await api.get(`/quiz/quizzes/${id}/`);
        setQuiz(res.data.quiz);
        setQuestions(res.data.questions);
        setTimeLeft(res.data.quiz.time_limit_minutes * 60);
      } catch (err) {
        toast.error("Failed to load quiz");
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id, navigate]);

  useEffect(() => {
    if (loading || timeLeft <= 0 || isSubmitting) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          autoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, timeLeft, isSubmitting]);

  const autoSubmit = () => {
    toast.error("Time's up! Submitting answers automatically.");
    handleSubmit();
  };

  const handleSelect = (choiceId) => {
    const currentQ = questions[currentIndex];
    // Lock answer once selected
    if (answers[currentQ.id]) return;
    setAnswers(prev => ({ ...prev, [currentQ.id]: choiceId }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await api.post('/quiz/attempts/submit/', {
        quiz_id: id,
        answers: answers
      });
      navigate('/result', { state: { attempt: res.data }});
    } catch (err) {
      toast.error("Failed to submit quiz");
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#020617]">
        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#020617] text-white p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">No Questions Available</h2>
        <p className="text-slate-400 mb-8">This quiz doesn't have any questions yet.</p>
        <button onClick={() => navigate('/')} className="px-6 py-3 bg-indigo-600 rounded-xl font-bold">Go Back</button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="flex-1 flex flex-col bg-[#020617] text-white">
      {/* Header Bar */}
      <div className="bg-[#0f172a] border-b border-white/5 p-4 flex justify-between items-center sticky top-0 z-20">
        <div>
          <h1 className="font-bold text-lg hidden sm:block">{quiz?.title}</h1>
          <span className="text-xs text-indigo-400 font-bold tracking-widest uppercase">{quiz?.category_name}</span>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg ${timeLeft < 60 ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' : 'bg-black/40 border border-white/10 text-slate-300'}`}>
          <Clock size={20} />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-black/50">
        <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      {/* Question Container */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-[800px] w-full bg-[#0f172a]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-6 md:p-10 shadow-2xl relative">
          
          <div className="flex justify-between items-center mb-5 sm:mb-6">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Question {currentIndex + 1} of {questions.length}</span>
            <span className={`text-[0.65rem] font-bold uppercase tracking-widest px-3 py-1 rounded-md border ${currentQ.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : currentQ.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
              {currentQ.difficulty}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-10 leading-tight">{currentQ.text}</h2>

          <div className="space-y-3 sm:space-y-4">
            {currentQ.choices.map(choice => {
              const selectedAnswerId = answers[currentQ.id];
              const hasAnswered = !!selectedAnswerId;
              const isSelected = selectedAnswerId === choice.id;
              
              let btnClass = "bg-black/30 border-white/5 hover:border-indigo-500/30 hover:bg-white/5";
              let textClass = "text-slate-300";
              let circleClass = "border-slate-600 group-hover:border-indigo-400/50";
              
              if (hasAnswered) {
                if (choice.is_correct) {
                  btnClass = "bg-emerald-500/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
                  textClass = "text-white font-semibold";
                  circleClass = "border-emerald-500 bg-emerald-500";
                } else if (isSelected) {
                  btnClass = "bg-red-500/20 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]";
                  textClass = "text-white font-semibold";
                  circleClass = "border-red-500 bg-red-500";
                } else {
                  btnClass = "bg-black/30 border-white/5 opacity-50";
                }
              }

              return (
                <button
                  key={choice.id}
                  onClick={() => handleSelect(choice.id)}
                  disabled={hasAnswered}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group ${btnClass}`}
                >
                  <span className={`text-base sm:text-lg pr-4 ${textClass}`}>{choice.text}</span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${circleClass}`}>
                    {hasAnswered && choice.is_correct && <CheckCircle2 size={16} className="text-white" />}
                    {hasAnswered && isSelected && !choice.is_correct && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-[#0f172a] border-t border-white/5 p-4 md:p-6 flex justify-between items-center gap-4">
        <button 
          onClick={() => setCurrentIndex(prev => prev - 1)}
          disabled={currentIndex === 0}
          className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={20} /> <span className="hidden sm:block">Previous</span>
        </button>

        {!isLastQuestion ? (
          <button 
            onClick={() => setCurrentIndex(prev => prev + 1)}
            disabled={!answers[currentQ.id]}
            className="px-6 sm:px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="hidden sm:block">Next Question</span> <ChevronRight size={20} />
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || !answers[currentQ.id]}
            className="px-6 sm:px-10 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl font-black text-base sm:text-lg flex items-center gap-2 shadow-xl shadow-emerald-500/20 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : <span className="hidden sm:inline">Submit Final Answers</span>}
            {!isSubmitting && <span className="sm:hidden">Submit</span>}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizSession;
