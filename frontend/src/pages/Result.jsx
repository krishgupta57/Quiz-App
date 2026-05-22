import { useLocation, useNavigate } from 'react-router-dom';
import { Trophy, Home, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const attempt = location.state?.attempt;

  if (!attempt) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#020617] text-white p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">No Result Found</h2>
        <button onClick={() => navigate('/')} className="px-6 py-3 bg-indigo-600 rounded-xl font-bold">Go to Dashboard</button>
      </div>

    );
  }

  const { score, total, percentage, quiz_title, quiz: quizId } = attempt;

  let message = "";
  let color = "text-indigo-500";
  let ringColor = "#6366f1"; 
  let bgGradient = "from-indigo-600 to-indigo-800";

  if (percentage >= 80) {
    message = "Outstanding! You nailed it.";
    color = "text-emerald-400";
    ringColor = "#10b981";
    bgGradient = "from-emerald-500 to-teal-600";
  } else if (percentage >= 50) {
    message = "Good effort! Keep practicing.";
    color = "text-amber-400";
    ringColor = "#f59e0b";
    bgGradient = "from-amber-500 to-orange-600";
  } else {
    message = "Don't give up! Try again to improve.";
    color = "text-red-400";
    ringColor = "#ef4444";
    bgGradient = "from-red-500 to-rose-600";
  }

  return (
    <div className="flex-1 min-h-screen flex flex-col items-center justify-center p-4 w-full bg-[#020617] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-8 w-72 h-72 bg-[#7c3aed]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-6 w-80 h-80 bg-[#0ea5e9]/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-[600px] h-[600px] bg-gradient-to-r ${bgGradient} opacity-10 rounded-full blur-[150px]`} />
        </div>
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[640px] p-8 md:p-12 bg-[#0b1122]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_35px_120px_-55px_rgba(56,189,248,0.7)]"
      >
        <div className="mb-8 text-center">
          <p className="inline-flex items-center justify-center gap-2 text-xs uppercase tracking-[0.4em] text-slate-400 font-semibold mb-3">
            <Trophy size={14} className="opacity-80" /> Quiz Completed
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">Your Result is In</h2>
          <p className="mt-3 text-sm text-slate-400 max-w-[520px] mx-auto">
            {quiz_title} has been graded. Celebrate your progress and use the score to sharpen your next attempt.
          </p>
        </div>

        <div className="relative w-44 h-44 mx-auto mb-10">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
            <motion.path
              initial={{ strokeDasharray: '0, 100' }}
              animate={{ strokeDasharray: `${percentage}, 100` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={ringColor}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center rotate-90">
            <Trophy size={34} color={ringColor} className="mb-2 opacity-90" />
            <span className={`text-3xl md:text-4xl font-black ${color}`}>{Math.round(percentage)}%</span>
          </div>
        </div>

        <div className="mb-10">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tight">
            {score} <span className="text-2xl md:text-3xl text-slate-500 font-medium">/ {total}</span>
          </h1>
          <p className={`text-xl md:text-2xl font-semibold uppercase tracking-[0.18em] ${color}`}>{message}</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-white font-semibold py-4 px-8 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 transition-all duration-200"
          >
            <Home size={18} /> Return to Dashboard
          </button>
          <button
            onClick={() => quizId ? navigate(`/quiz/${quizId}`) : navigate('/streak-mode')}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 text-white font-semibold py-4 px-10 rounded-2xl bg-gradient-to-r ${bgGradient} shadow-lg shadow-slate-900/40 transition-transform duration-200 hover:-translate-y-1`}
          >
            Retake Quiz <ChevronRight size={18} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Result;
