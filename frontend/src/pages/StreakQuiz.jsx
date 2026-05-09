import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy, RotateCcw, ChevronRight, AlertCircle, CheckCircle2, XCircle, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const StreakQuiz = () => {
  const [question, setQuestion] = useState(null);
  const [nextQuestion, setNextQuestion] = useState(null);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const navigate = useNavigate();

  const fetchMaxStreak = useCallback(async () => {
    try {
      const res = await api.get('/quiz/streak/');
      setMaxStreak(res.data.max_streak);
    } catch (err) {
      console.error("Failed to fetch streak stats");
    }
  }, []);

  // Pre-fetch the next question in the background for zero lag
  const prefetchNext = useCallback(async () => {
    try {
      const res = await api.get('/quiz/streak/');
      setNextQuestion(res.data);
    } catch (err) {
      console.error("Pre-fetch failed, will retry on next turn");
    }
  }, []);

  const startQuiz = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/quiz/streak/');
      setQuestion(res.data);
      // Immediately start fetching the one after
      prefetchNext();
    } catch (err) {
      toast.error("Connecting to World Trivia...");
    } finally {
      setLoading(false);
    }
  }, [prefetchNext]);

  useEffect(() => {
    fetchMaxStreak();
    startQuiz();
  }, [fetchMaxStreak, startQuiz]);

  const handleAnswer = async (choice) => {
    if (selectedChoice !== null) return;
    
    setSelectedChoice(choice.id);
    const correct = choice.is_correct;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setStreak(prev => prev + 1);
    } else {
      try {
        await api.post('/quiz/streak/', { streak });
      } catch (err) {
        console.error("Failed to save high score");
      }
    }
  };

  const handleNext = () => {
    if (isCorrect) {
      // Use the pre-fetched question instantly!
      if (nextQuestion) {
        setQuestion(nextQuestion);
        setNextQuestion(null);
        setSelectedChoice(null);
        setIsCorrect(null);
        setShowResult(false);
        // Start pre-fetching the one after that
        prefetchNext();
      } else {
        // Fallback if network was too slow to pre-fetch
        startQuiz();
      }
    } else {
      setGameOver(true);
    }
  };

  const restart = () => {
    setStreak(0);
    setGameOver(false);
    setShowResult(false);
    startQuiz();
    fetchMaxStreak();
  };

  if (gameOver) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#020617]">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md bg-[#0f172a]/80 backdrop-blur-2xl border border-white/10 rounded-[40px] p-10 text-center shadow-2xl"
        >
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30 text-red-500">
            <AlertCircle size={48} />
          </div>
          <h2 className="text-4xl font-black text-white mb-2 tracking-tighter">SURVIVAL ENDED</h2>
          <p className="text-slate-400 mb-8 text-lg">Your final streak: <span className="text-orange-500 font-black">{streak}</span></p>
          <button onClick={restart} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2">
            <RotateCcw size={20} /> Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-[#020617] relative overflow-hidden">
      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <motion.div key={streak} initial={{ scale: 1.5 }} animate={{ scale: 1 }} className="flex items-center gap-2 bg-black/40 border border-white/10 px-6 py-3 rounded-2xl shadow-xl">
            <Flame className={`${streak > 0 ? 'text-orange-500 animate-pulse' : 'text-slate-600'}`} size={28} />
            <span className="text-3xl font-black text-white tracking-tighter">{streak}</span>
          </motion.div>
          <div className="flex items-center gap-2 text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20">
            <Zap size={16} className="animate-pulse" />
            <span className="text-[0.65rem] font-black uppercase tracking-widest">Instant Mode Active</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4" />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Calibrating World Trivia...</p>
            </motion.div>
          ) : (
            <motion.div key={question?.text} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="bg-[#0f172a]/60 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 sm:p-12 shadow-2xl">
              <div className="mb-10">
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="inline-block px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[0.65rem] font-black rounded-lg border border-indigo-500/20 uppercase tracking-widest">
                    {question?.category}
                  </span>
                  <span className="inline-block px-3 py-1 bg-orange-500/10 text-orange-400 text-[0.65rem] font-black rounded-lg border border-orange-500/20 uppercase tracking-widest">
                    {question?.difficulty}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-bold text-white leading-[1.1] tracking-tight">{question?.text}</h2>
              </div>

              <div className="grid gap-4">
                {question?.choices.map((choice) => (
                  <button key={choice.text} onClick={() => handleAnswer(choice)} disabled={showResult} className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 ${
                    showResult ? choice.is_correct ? 'bg-emerald-500/20 border-emerald-500 text-white' : selectedChoice === choice.id ? 'bg-red-500/20 border-red-500 text-white' : 'bg-white/5 border-white/5 opacity-40' : 'bg-white/5 border-white/5 hover:border-indigo-500/50 text-slate-300'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">{choice.text}</span>
                      {showResult && (choice.is_correct ? <CheckCircle2 className="text-emerald-400" /> : selectedChoice === choice.id ? <XCircle className="text-red-400" /> : null)}
                    </div>
                  </button>
                ))}
              </div>

              {showResult && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-12">
                  <button onClick={handleNext} className={`w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 shadow-2xl ${
                    isCorrect ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/30' : 'bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-red-500/30'
                  }`}>
                    <span>{isCorrect ? 'Next Question' : 'View Final Score'}</span>
                    <ChevronRight size={24} />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StreakQuiz;
