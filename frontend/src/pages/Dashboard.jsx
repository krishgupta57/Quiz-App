import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Flame, Globe, FolderTree, FileText, ChevronRight, LayoutDashboard, History } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingResults, setLoadingResults] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchResults();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/quiz/categories/');
      setCategories(res.data);
    } catch (err) {
      toast.error("Failed to load categories");
    } finally {
      setLoadingCats(false);
    }
  };

  const fetchResults = async () => {
    try {
      const res = await api.get('/quiz/attempts/');
      setResults(res.data.slice(0, 5)); // Show top 5 recent
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleCategoryClick = async (catId) => {
    if (selectedCategory === catId) {
      setSelectedCategory(null);
      return;
    }
    setSelectedCategory(catId);
    try {
      const res = await api.get(`/quiz/quizzes/?category_id=${catId}`);
      setQuizzes(res.data);
    } catch (err) {
      toast.error("Failed to load quizzes");
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 bg-[#020617] text-white overflow-y-auto w-full">
      <div className="max-w-[1200px] mx-auto">
        <header className="mb-12 text-center md:text-left pt-6">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Welcome back, <span className="text-indigo-400">{user?.username}</span></h1>
          <p className="text-lg text-slate-400">Select a learning path to test your knowledge or continue your world trivia streak.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* World Trivia Banner */}
            <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 border border-orange-500/20 rounded-[30px] p-8 relative overflow-hidden group cursor-pointer transition-all hover:border-orange-500/40" onClick={() => navigate('/streak-mode')}>
              <div className="absolute right-0 top-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] -mr-10 -mt-10 group-hover:bg-orange-500/20 transition-all duration-500"/>
              <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                <div className="bg-orange-500/20 p-5 rounded-2xl">
                  <Flame size={40} className="text-orange-500 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">World Trivia Streak</h2>
                  <p className="text-orange-200/70 mb-4 sm:mb-0">Infinite random questions. Sudden death mode.</p>
                </div>
                <button className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold rounded-xl whitespace-nowrap shadow-[0_0_20px_rgba(249,115,22,0.4)]">Play Now</button>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3"><FolderTree className="text-indigo-400"/> Learning Paths</h3>
              {loadingCats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white/5 animate-pulse rounded-2xl" />)}
                </div>
              ) : categories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex flex-col">
                      <button 
                        onClick={() => handleCategoryClick(cat.id)}
                        className={`w-full text-left p-6 rounded-2xl border transition-all ${selectedCategory === cat.id ? 'bg-indigo-600/10 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)]' : 'bg-[#0f172a]/60 border-white/5 hover:border-white/10 hover:bg-white/[0.03]'}`}
                      >
                        <h4 className="text-xl font-bold mb-2 text-white">{cat.name}</h4>
                        <p className="text-slate-400 text-sm line-clamp-2">{cat.description || 'Explore quizzes in this category'}</p>
                      </button>
                      
                      {/* Quizzes Dropdown */}
                      {selectedCategory === cat.id && (
                        <div className="mt-3 ml-4 border-l-2 border-indigo-500/30 pl-4 space-y-2 mb-2">
                          {quizzes.length > 0 ? quizzes.map(q => (
                            <button key={q.id} onClick={() => navigate(`/quiz/${q.id}`)} className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-indigo-500/30 group">
                              <div className="text-left">
                                <h5 className="font-bold text-indigo-100">{q.title}</h5>
                                <div className="text-xs text-slate-400 flex gap-3 mt-1">
                                  <span>{q.question_count} Questions</span>
                                  <span>{q.time_limit_minutes}m limit</span>
                                </div>
                              </div>
                              <ChevronRight className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
                            </button>
                          )) : (
                            <div className="p-4 text-sm text-slate-500 italic bg-white/5 rounded-xl">No quizzes available in this path yet.</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-[#0f172a]/60 rounded-2xl border border-dashed border-white/10 text-slate-400">
                  No learning paths available. Admins need to create categories.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            {/* Recent Results */}
            <div className="bg-[#0f172a]/60 border border-white/5 rounded-3xl p-6 lg:sticky lg:top-8">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><History size={20} className="text-indigo-400" /> Recent Results</h3>
              {loadingResults ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => <div key={i} className="h-20 bg-white/5 animate-pulse rounded-xl" />)}
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-4">
                  {results.map(r => (
                    <div key={r.id} className="p-4 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm text-indigo-100 line-clamp-1 pr-2">{r.quiz_title}</span>
                        <span className={`text-xs font-black px-2 py-0.5 rounded shrink-0 ${r.percentage >= 80 ? 'bg-emerald-500/20 text-emerald-400' : r.percentage >= 50 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>{r.percentage}%</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 mt-2">
                        <span>{r.score}/{r.total} Correct</span>
                        <span>{r.created_at.split(' ')[0]}</span>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => navigate('/results')} className="w-full py-3 text-sm font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-xl transition-colors mt-4">View Full History</button>
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-slate-500 bg-black/20 rounded-xl">
                  You haven't taken any quizzes yet. Your history will appear here.
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
