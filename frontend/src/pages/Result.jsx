import { useLocation, useNavigate } from 'react-router-dom';
import { Trophy, RefreshCcw, Home } from 'lucide-react';

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const score = location.state?.score || 0;
  const total = location.state?.total || 1;

  const percentage = (score / total) * 100;
  let message = "";
  let color = "text-indigo-500";
  let ringColor = "#6366f1"; // matching text-indigo-500 equivalent for SVG stroke
  let btnClass = "bg-indigo-600 hover:bg-indigo-500";

  if (percentage >= 80) {
    message = "Outstanding! You nailed it.";
    color = "text-emerald-500";
    ringColor = "#10b981";
    btnClass = "bg-emerald-600 hover:bg-emerald-500";
  } else if (percentage >= 50) {
    message = "Good effort! Keep practicing.";
    color = "text-amber-500";
    ringColor = "#f59e0b";
    btnClass = "bg-amber-600 hover:bg-amber-500";
  } else {
    message = "Don't give up! Try again to improve.";
    color = "text-red-500";
    ringColor = "#ef4444";
    btnClass = "bg-red-600 hover:bg-red-500";
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 w-full">
      <div className="bg-[#0f172a]/70 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-[600px] p-12 md:p-16 text-center shadow-2xl animate-fade-in relative overflow-hidden">
        
        <div className="relative w-32 h-32 mx-auto mb-8">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={ringColor}
              strokeWidth="3"
              strokeDasharray={`${percentage}, 100`}
              className="transition-[stroke-dasharray] duration-1000 ease-out"
            />
            <Trophy x="8" y="8" size={20} color={ringColor} className="rotate-90" />
          </svg>
        </div>

        <h1 className="text-6xl font-black text-white mb-2">
          {score} <span className="text-3xl text-slate-500">/ {total}</span>
        </h1>
        
        <h2 className={`text-2xl font-bold mb-4 ${color}`}>{message}</h2>
        
        <p className="text-lg text-slate-400 mb-12">
          You scored <span className="text-white font-semibold">{Math.round(percentage)}%</span> on this quiz attempt.
        </p>

        <div className="flex justify-center items-center mt-4">
          <button 
            onClick={() => navigate('/quiz')} 
            className={`inline-flex items-center justify-center gap-2 text-white font-semibold py-3.5 px-10 rounded-xl transition-all duration-300 w-full sm:w-auto shadow-lg hover:-translate-y-0.5 ${btnClass}`}
          >
            <RefreshCcw size={18} />
            Retake Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default Result;
