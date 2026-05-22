import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Search, 
  RotateCcw, 
  Award, 
  Trophy, 
  Activity, 
  History, 
  Calendar, 
  ArrowUpDown,
  SlidersHorizontal
} from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const ResultsHistory = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search, Filter, and Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, passed (>=80), average (50-79), poor (<50)
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, highest, lowest

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await api.get('/quiz/attempts/');
      setResults(res.data);
    } catch (err) {
      toast.error("Failed to load results history");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Calculate Stats
  const stats = useMemo(() => {
    if (results.length === 0) {
      return { total: 0, avg: 0, highest: 0, passed: 0 };
    }
    const total = results.length;
    const sum = results.reduce((acc, curr) => acc + curr.percentage, 0);
    const avg = Math.round(sum / total);
    const highest = Math.max(...results.map(r => r.percentage));
    const passed = results.filter(r => r.percentage >= 80).length;

    return { total, avg, highest, passed };
  }, [results]);

  // 2. Filter & Sort Logic
  const processedResults = useMemo(() => {
    let list = [...results];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(r => r.quiz_title.toLowerCase().includes(query));
    }

    // Status filter
    if (statusFilter !== 'all') {
      list = list.filter(r => {
        if (statusFilter === 'passed') return r.percentage >= 80;
        if (statusFilter === 'average') return r.percentage >= 50 && r.percentage < 80;
        if (statusFilter === 'poor') return r.percentage < 50;
        return true;
      });
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      if (sortBy === 'highest') {
        return b.percentage - a.percentage;
      }
      if (sortBy === 'lowest') {
        return a.percentage - b.percentage;
      }
      return 0;
    });

    return list;
  }, [results, searchQuery, statusFilter, sortBy]);

  // Navigate to retake quiz
  const handleRetake = (attempt) => {
    if (attempt.quiz) {
      navigate(`/quiz/${attempt.quiz}`);
    } else {
      navigate('/streak-mode');
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-[#020617] text-white p-4 sm:p-6 md:p-8 overflow-y-auto">
      {/* Background decoration orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-[1100px] mx-auto relative z-10 pt-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-10">
          <div>
            <button 
              onClick={() => navigate('/')} 
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-400 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/5 transition-all mb-4"
            >
              <ChevronLeft size={16} /> Back to Dashboard
            </button>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight flex items-center gap-3">
              <History className="text-indigo-400 w-8 h-8 sm:w-10 sm:h-10" />
              <span>Results History</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-2">Track your progress, review past performances, and attempt quizzes again to improve.</p>
          </div>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Card 1: Total Attempts */}
          <div className="bg-[#0f172a]/60 border border-white/5 rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 backdrop-blur-xl">
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 shrink-0">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Taken</p>
              <h3 className="text-xl sm:text-2xl font-black">{stats.total}</h3>
            </div>
          </div>

          {/* Card 2: Avg Score */}
          <div className="bg-[#0f172a]/60 border border-white/5 rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 backdrop-blur-xl">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 shrink-0">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Score</p>
              <h3 className="text-xl sm:text-2xl font-black">{stats.avg}%</h3>
            </div>
          </div>

          {/* Card 3: Best Percentage */}
          <div className="bg-[#0f172a]/60 border border-white/5 rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 backdrop-blur-xl">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 shrink-0">
              <Award size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">High Score</p>
              <h3 className="text-xl sm:text-2xl font-black">{stats.highest}%</h3>
            </div>
          </div>

          {/* Card 4: Passed Attempts */}
          <div className="bg-[#0f172a]/60 border border-white/5 rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 backdrop-blur-xl">
            <div className="p-3 bg-teal-500/10 rounded-xl text-teal-400 shrink-0">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mastered (≥80%)</p>
              <h3 className="text-xl sm:text-2xl font-black">{stats.passed}</h3>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-[#0f172a]/40 border border-white/5 rounded-3xl p-4 sm:p-5 md:p-6 backdrop-blur-md mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text"
                placeholder="Search quiz name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 hover:border-white/20 focus:border-indigo-500/50 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>

            {/* Filter controls group */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 shrink-0">
              
              {/* Category/Status dropdown */}
              <div className="flex items-center gap-2 bg-black/30 border border-white/5 rounded-2xl px-3 py-2">
                <SlidersHorizontal size={14} className="text-slate-400" />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent border-none text-xs sm:text-sm font-semibold text-slate-300 focus:outline-none cursor-pointer pr-4"
                >
                  <option value="all">All Grades</option>
                  <option value="passed">Passed (≥80%)</option>
                  <option value="average">Average (50-79%)</option>
                  <option value="poor">Needs Practice (&lt;50%)</option>
                </select>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2 bg-black/30 border border-white/5 rounded-2xl px-3 py-2">
                <ArrowUpDown size={14} className="text-slate-400" />
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none text-xs sm:text-sm font-semibold text-slate-300 focus:outline-none cursor-pointer pr-4"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Score</option>
                  <option value="lowest">Lowest Score</option>
                </select>
              </div>

            </div>
          </div>
        </div>

        {/* Results Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-white/5 border border-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : processedResults.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <AnimatePresence mode="popLayout">
              {processedResults.map(item => {
                let badgeClass = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
                if (item.percentage >= 80) {
                  badgeClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                } else if (item.percentage >= 50) {
                  badgeClass = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                } else {
                  badgeClass = "bg-red-500/10 text-red-400 border-red-500/20";
                }

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="p-4 sm:p-6 bg-[#0f172a]/40 border border-white/5 hover:border-white/10 rounded-[20px] transition-all hover:bg-white/[0.01] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                        <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {item.quiz_title}
                        </h4>
                        {!item.quiz && (
                          <span className="px-2 py-0.5 rounded-md text-[0.65rem] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            World Trivia
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={13} /> {item.created_at}
                        </span>
                        <span>•</span>
                        <span>{item.score}/{item.total} Correct Answers</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-none border-white/5 pt-3 sm:pt-0 shrink-0">
                      <div className={`px-4 py-2 border rounded-xl flex items-center justify-center shrink-0 ${badgeClass}`}>
                        <span className="text-base sm:text-lg font-black tracking-tight">{Math.round(item.percentage)}%</span>
                      </div>
                      
                      <button 
                        onClick={() => handleRetake(item)}
                        className="flex-1 sm:flex-none py-3 px-5 sm:px-6 bg-indigo-500/10 hover:bg-indigo-600 text-indigo-400 hover:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-indigo-500/20 group/btn shrink-0"
                      >
                        <RotateCcw size={16} className="group-hover/btn:rotate-180 transition-transform duration-500" />
                        <span>Retake</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-[#0f172a]/30 rounded-3xl border border-dashed border-white/10 text-slate-400"
          >
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
              <SlidersHorizontal size={24} className="text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Results Found</h3>
            <p className="text-sm text-slate-500 max-w-[320px] mx-auto">
              We couldn't find any results matching your filters. Try checking other search terms or grades.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ResultsHistory;
