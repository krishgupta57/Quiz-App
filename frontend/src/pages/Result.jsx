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

  const { score, total, percentage, quiz_title } = attempt;

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
    <div className="flex-1 flex flex-col items-center justify-center p-4 w-full bg-[#020617] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r ${bgGradient} opacity-10 rounded-full blur-[150px]`} />
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-[#0f172a]/70 backdrop-blur-2xl border border-white/10 rounded-3xl w-full max-w-[600px] p-10 md:p-14 text-center shadow-2xl relative z-10"
      >
        <span className="inline-block px-4 py-1.5 bg-white/5 rounded-full text-slate-300 text-sm font-bold tracking-widest uppercase mb-8 border border-white/10">
          {quiz_title}
        </span>

        <div className="relative w-40 h-40 mx-auto mb-10">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
            <motion.path
              initial={{ strokeDasharray: "0, 100" }}
              animate={{ strokeDasharray: `${percentage}, 100` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" stroke={ringColor} strokeWidth="3" strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center rotate-90">
             <Trophy size={32} color={ringColor} className="mb-1 opacity-80" />
             <span className={`text-2xl font-black ${color}`}>{Math.round(percentage)}%</span>
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tighter">
          {score} <span className="text-2xl text-slate-500 font-normal">/ {total}</span>
        </h1>
        
        <h2 className={`text-xl font-bold mb-10 uppercase tracking-widest ${color}`}>{message}</h2>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
          <button onClick={() => navigate('/')} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-white font-bold py-4 px-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
            <Home size={18} /> Return to Dashboard
          </button>
          <button onClick={() => window.location.reload()} className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 text-white font-bold py-4 px-10 rounded-xl bg-gradient-to-r ${bgGradient} shadow-lg transition-all transform hover:-translate-y-1`}>
            Retake Quiz <ChevronRight size={18} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Result;
