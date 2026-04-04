import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { ChevronRight, ArrowRight, CheckCircle2, Circle } from 'lucide-react';

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await api.get('/quiz/questions/');
        setQuestions(res.data);
      } catch (err) {
        console.error("Failed to load questions", err);
      }
      setLoading(false);
    }
    fetchQuestions();
  }, []);

  const handleSelectChoice = (questionId, choiceId) => {
    setAnswers({
      ...answers,
      [questionId]: choiceId
    });
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // payload format: {"question_id_str": "choice_id_str"}
      const payload = {};
      Object.keys(answers).forEach((qId) => {
        payload[qId] = answers[qId].toString();
      });

      const res = await api.post('/quiz/submit/', payload);
      navigate('/result', { state: { score: res.data.score, total: res.data.total } });
    } catch (err) {
      console.error("Failed to submit quiz", err);
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex flex-1 items-center justify-center text-slate-400">Loading Quiz...</div>;
  if (questions.length === 0) return <div className="flex flex-1 items-center justify-center text-slate-400">No questions available.</div>;

  const currentQuestion = questions[currentIdx];
  const selectedChoiceId = answers[currentQuestion.id];
  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="flex-1 flex flex-col items-center pt-16 px-4 w-full">
      
      {/* Progress Bar */}
      <div className="w-full max-w-[800px] mb-8">
        <div className="flex justify-between mb-2 text-sm font-semibold text-slate-300">
          <span>Question {currentIdx + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-[#0f172a]/70 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-[800px] p-8 md:p-12 relative animate-fade-in shadow-2xl">
        
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-8 leading-tight">
          {currentQuestion.text}
        </h2>

        <div className="flex flex-col gap-4">
          {currentQuestion.choices.map((choice) => {
            const isSelected = selectedChoiceId === choice.id;
            return (
              <div 
                key={choice.id}
                onClick={() => handleSelectChoice(currentQuestion.id, choice.id)}
                className={`flex items-center p-5 md:p-6 rounded-xl cursor-pointer border-2 transition-all duration-300 ${
                  isSelected 
                    ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02] shadow-[0_4px_20px_rgba(99,102,241,0.15)]' 
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                {isSelected ? (
                  <CheckCircle2 className="text-indigo-400 mr-4 shrink-0" size={24} />
                ) : (
                  <Circle className="text-slate-500 mr-4 shrink-0 group-hover:text-slate-400 transition-colors" size={24} />
                )}
                <span className={`text-lg transition-colors ${isSelected ? 'font-semibold text-white' : 'font-medium text-slate-300'}`}>
                  {choice.text}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end mt-12">
          {currentIdx === questions.length - 1 ? (
            <button 
              onClick={handleSubmit} 
              disabled={submitting || !selectedChoiceId} 
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3.5 px-8 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
            >
              {submitting ? 'Submitting...' : 'Complete Quiz'}
              <CheckCircle2 size={20} />
            </button>
          ) : (
            <button 
              onClick={handleNext} 
              disabled={!selectedChoiceId}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 px-8 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
            >
              Next Question
              <ArrowRight size={20} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default Quiz;
