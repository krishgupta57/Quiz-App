import { useState, useEffect } from 'react';
import api from '../api';
import { Users, Trash2, LayoutDashboard, RefreshCw, LogOut, Trophy, FolderTree, FileQuestion, PlusCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const navigate = useNavigate();
  
  // States
  const [attempts, setAttempts] = useState([]);
  const [users, setUsers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [categories, setCategories] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Forms
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuizDesc, setNewQuizDesc] = useState('');
  const [newQuizTime, setNewQuizTime] = useState(10);
  const [newQuizCat, setNewQuizCat] = useState('');

  const [questionText, setQuestionText] = useState('');
  const [questionDifficulty, setQuestionDifficulty] = useState('Medium');
  const [questionQuizId, setQuestionQuizId] = useState('');
  const [choices, setChoices] = useState([
    { text: '', is_correct: true },
    { text: '', is_correct: false },
    { text: '', is_correct: false },
    { text: '', is_correct: false }
  ]);

  const fetchData = async (endpoint, setter) => {
    setLoading(true);
    try {
      const res = await api.get(endpoint);
      setter(res.data);
    } catch (err) {
      toast.error(`Failed to fetch data`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') fetchData('/accounts/users/', setUsers);
    if (activeTab === 'dashboard') fetchData('/quiz/attempts/', setAttempts);
    if (activeTab === 'leaderboard') fetchData('/quiz/leaderboard/', setLeaderboard);
    if (activeTab === 'categories') fetchData('/quiz/categories/', setCategories);
    if (activeTab === 'quizzes') {
      fetchData('/quiz/categories/', setCategories);
      fetchData('/quiz/quizzes/', setQuizzes);
    }
    if (activeTab === 'questions') {
      fetchData('/quiz/quizzes/', setQuizzes);
    }
  }, [activeTab]);

  const deleteItem = async (endpoint, id, state, setState) => {
    toast.promise(
      api.delete(`${endpoint}${id}/`),
      {
        loading: 'Deleting...',
        success: () => {
          setState(state.filter(item => item.id !== id));
          return 'Deleted successfully';
        },
        error: 'Error deleting item',
      }
    );
  };

  const createCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/quiz/categories/', { name: newCatName, description: newCatDesc });
      setCategories([...categories, res.data]);
      setNewCatName(''); setNewCatDesc('');
      toast.success("Category created");
    } catch (err) { toast.error("Failed to create category"); }
  };

  const createQuiz = async (e) => {
    e.preventDefault();
    if (!newQuizCat) return toast.error("Select a category");
    try {
      const res = await api.post('/quiz/quizzes/', { 
        title: newQuizTitle, description: newQuizDesc, 
        time_limit_minutes: newQuizTime, category: newQuizCat 
      });
      setQuizzes([...quizzes, res.data]);
      setNewQuizTitle(''); setNewQuizDesc('');
      toast.success("Quiz created");
    } catch (err) { toast.error("Failed to create quiz"); }
  };

  const setCorrectChoice = (index) => {
    const newChoices = choices.map((c, i) => ({ ...c, is_correct: i === index }));
    setChoices(newChoices);
  };

  const submitQuestion = async (e) => {
    e.preventDefault();
    if (!questionQuizId) return toast.error("Select a quiz");
    try {
      await api.post('/quiz/questions/', {
        quiz_id: questionQuizId, text: questionText, difficulty: questionDifficulty, choices
      });
      toast.success("Question added!");
      setQuestionText('');
      setChoices([{text: '', is_correct: true}, {text: '', is_correct: false}, {text: '', is_correct: false}, {text: '', is_correct: false}]);
    } catch (err) { toast.error("Failed to add question"); }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out from Admin Portal");
    navigate('/admin/login');
  };

  const tabVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  const tabs = [
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'quizzes', label: 'Quizzes', icon: FileQuestion },
    { id: 'questions', label: 'Questions', icon: PlusCircle },
    { id: 'dashboard', label: 'Marks Audit', icon: LayoutDashboard },
    { id: 'leaderboard', label: 'Streak Leaders', icon: Trophy },
    { id: 'users', label: 'Users', icon: Users },
  ];

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 py-6 md:py-8 animate-fade-in flex-1">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 md:mb-10 gap-6 bg-[#0f172a]/40 p-5 md:p-6 rounded-3xl border border-white/5 backdrop-blur-sm text-center md:text-left">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System Audit Dashboard</h1>
          <p className="text-slate-400 mt-1">Manage platform content and monitor student performance</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all border border-red-500/20 text-sm font-semibold">
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="flex justify-center mb-8 md:mb-12">
        <div className="flex flex-wrap justify-center bg-black/30 p-1.5 rounded-2xl border border-white/10 gap-2 sm:gap-1 shadow-inner max-w-full">
          {tabs.map(tab => (
            <button key={tab.id} className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 font-semibold rounded-xl text-[0.8rem] sm:text-[0.85rem] transition-all duration-300 ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-[0_4px_15px_rgba(99,102,241,0.4)] scale-105' : 'bg-transparent text-slate-400 hover:text-white'}`} onClick={() => setActiveTab(tab.id)}>
              <tab.icon size={16} className="shrink-0" /> <span className="hidden sm:inline md:inline lg:inline xl:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[900px] mx-auto">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} variants={tabVariants} initial="initial" animate="animate" exit="exit" className="bg-[#0f172a]/60 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-16 -mt-16 pointer-events-none" />
            
            {activeTab === 'categories' && (
              <div className="relative">
                <h2 className="text-2xl font-bold text-white mb-6">Manage Categories</h2>
                <form onSubmit={createCategory} className="flex flex-col sm:flex-row gap-4 mb-8">
                  <input type="text" placeholder="Category Name (e.g. Frontend)" value={newCatName} onChange={e => setNewCatName(e.target.value)} className="flex-1 px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500" required />
                  <input type="text" placeholder="Short Description" value={newCatDesc} onChange={e => setNewCatDesc(e.target.value)} className="flex-1 px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500" />
                  <button type="submit" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg">Add Category</button>
                </form>
                <div className="grid gap-4">
                  {categories.map(c => (
                    <div key={c.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center group">
                      <div>
                        <h3 className="font-bold text-white text-lg">{c.name}</h3>
                        <p className="text-sm text-slate-400">{c.description}</p>
                      </div>
                      <button onClick={() => deleteItem('/quiz/categories/', c.id, categories, setCategories)} className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-2.5 rounded-xl transition-all"><Trash2 size={18}/></button>
                    </div>
                  ))}
                  {categories.length === 0 && !loading && <div className="text-center py-8 text-slate-500">No categories created yet.</div>}
                </div>
              </div>
            )}

            {activeTab === 'quizzes' && (
              <div className="relative">
                <h2 className="text-2xl font-bold text-white mb-6">Manage Quizzes</h2>
                <form onSubmit={createQuiz} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <input type="text" placeholder="Quiz Title (e.g. React Basics)" value={newQuizTitle} onChange={e => setNewQuizTitle(e.target.value)} className="px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500" required />
                  <select value={newQuizCat} onChange={e => setNewQuizCat(e.target.value)} className="px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-slate-300 outline-none focus:border-indigo-500" required>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">Time Limit:</span>
                    <input type="number" placeholder="10" value={newQuizTime} onChange={e => setNewQuizTime(e.target.value)} className="w-full pl-24 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500" required />
                  </div>
                  <input type="text" placeholder="Description" value={newQuizDesc} onChange={e => setNewQuizDesc(e.target.value)} className="px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500" />
                  <button type="submit" className="col-span-1 sm:col-span-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg mt-2">Create Quiz Profile</button>
                </form>
                <div className="grid gap-4">
                  {quizzes.map(q => (
                    <div key={q.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center group">
                      <div>
                        <span className="text-[0.6rem] uppercase tracking-widest text-indigo-400 font-bold bg-indigo-500/10 px-2 py-1 rounded-md mb-2 inline-block">{q.category_name}</span>
                        <h3 className="font-bold text-white text-lg flex items-center gap-2">{q.title} <span className="text-xs text-slate-500 font-normal bg-black/50 px-2 py-0.5 rounded-full">{q.time_limit_minutes} min</span></h3>
                        <p className="text-sm text-slate-400 mt-1">{q.question_count} Questions Added</p>
                      </div>
                      <button onClick={() => deleteItem('/quiz/quizzes/', q.id, quizzes, setQuizzes)} className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-2.5 rounded-xl transition-all"><Trash2 size={18}/></button>
                    </div>
                  ))}
                  {quizzes.length === 0 && !loading && <div className="text-center py-8 text-slate-500">No quizzes created yet.</div>}
                </div>
              </div>
            )}

            {activeTab === 'questions' && (
              <div className="relative">
                <h2 className="text-2xl font-bold text-white mb-6">Author Questions</h2>
                <form onSubmit={submitQuestion} className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <select value={questionQuizId} onChange={e => setQuestionQuizId(e.target.value)} className="flex-1 px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-slate-300 outline-none focus:border-indigo-500" required>
                      <option value="">Assign to Quiz...</option>
                      {quizzes.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
                    </select>
                    <select value={questionDifficulty} onChange={e => setQuestionDifficulty(e.target.value)} className="sm:w-48 px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-slate-300 outline-none focus:border-indigo-500" required>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <textarea rows="3" placeholder="Enter the question text here..." value={questionText} onChange={e => setQuestionText(e.target.value)} className="w-full px-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 resize-none text-lg" required />
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Answer Options (Check the correct one)</label>
                    {choices.map((c, i) => (
                      <div key={i} className="flex gap-3 items-center group">
                        <button type="button" onClick={() => setCorrectChoice(i)} className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all border-2 ${c.is_correct ? 'bg-emerald-500 border-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/20' : 'bg-black/40 border-white/10 text-transparent hover:border-slate-500'}`}><Check size={18}/></button>
                        <input type="text" placeholder={`Option ${i+1}`} value={c.text} onChange={e => { const newC = [...choices]; newC[i].text = e.target.value; setChoices(newC); }} className={`flex-1 px-4 py-3 bg-black/40 border rounded-xl text-white outline-none transition-all ${c.is_correct ? 'border-emerald-500/40 focus:border-emerald-500' : 'border-white/10 focus:border-indigo-500'}`} required />
                      </div>
                    ))}
                  </div>
                  <button type="submit" className="w-full py-4 mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-emerald-500/20 transform hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2"><PlusCircle size={20}/> Publish Question to Quiz</button>
                </form>
              </div>
            )}

            {activeTab === 'dashboard' && (
              <div className="relative">
                <h2 className="text-2xl font-bold text-white mb-6">Student Audit Log</h2>
                <div className="overflow-x-auto w-full">
                  <table className="w-full border-collapse text-left whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="pb-4 pr-4 text-slate-400 font-semibold tracking-wider text-xs uppercase">Student</th>
                        <th className="pb-4 px-4 text-slate-400 font-semibold tracking-wider text-xs uppercase">Quiz</th>
                        <th className="pb-4 px-4 text-slate-400 font-semibold tracking-wider text-xs uppercase text-center">Score</th>
                        <th className="pb-4 pl-4 text-slate-400 font-semibold tracking-wider text-xs uppercase text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {attempts.map(att => (
                        <tr key={att.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="py-4 pr-4 text-white font-medium group-hover:text-indigo-300">{att.username}</td>
                          <td className="py-4 px-4 text-slate-300 text-sm">{att.quiz_title}</td>
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold ${att.percentage >= 80 ? 'bg-emerald-500/10 text-emerald-400' : att.percentage >= 50 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                              {att.score}/{att.total} ({att.percentage}%)
                            </span>
                          </td>
                          <td className="py-4 pl-4 text-slate-500 text-xs text-right font-mono">{att.created_at}</td>
                        </tr>
                      ))}
                      {attempts.length === 0 && !loading && <tr><td colSpan="4" className="text-center py-8 text-slate-500">No attempts yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="relative">
                <h2 className="text-2xl font-bold text-white mb-6">World Trivia Streak Champions</h2>
                <div className="overflow-x-auto w-full">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="pb-4 text-slate-400 font-semibold tracking-wider text-xs uppercase">Rank</th>
                        <th className="pb-4 text-slate-400 font-semibold tracking-wider text-xs uppercase">Student</th>
                        <th className="pb-4 text-slate-400 font-semibold tracking-wider text-xs uppercase text-center">Max Streak</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {leaderboard.map((stat, idx) => (
                        <tr key={stat.username} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 font-bold text-slate-500">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</td>
                          <td className="py-4 text-white font-medium">{stat.username}</td>
                          <td className="py-4 text-center"><span className="px-3 py-1 bg-orange-500/10 text-orange-400 rounded-full font-black text-sm">🔥 {stat.max_streak}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="relative">
                <h2 className="text-2xl font-bold text-white mb-6">System Users</h2>
                <div className="overflow-x-auto w-full">
                  <table className="w-full border-collapse text-left whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="pb-4 pr-4 text-slate-400 font-semibold tracking-wider text-xs uppercase">Username</th>
                        <th className="pb-4 pl-4 text-slate-400 font-semibold tracking-wider text-xs uppercase text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 pr-4 text-white font-medium flex items-center gap-2">
                            {u.username}
                            {u.is_staff && <span className="bg-indigo-500/10 text-indigo-400 text-[0.6rem] px-2 py-0.5 rounded uppercase font-bold">Admin</span>}
                          </td>
                          <td className="py-4 pl-4 text-right">
                            <button onClick={() => deleteUser(u.id)} disabled={u.is_staff} className="text-slate-500 hover:text-red-400 p-2 disabled:opacity-20"><Trash2 size={16}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
export default AdminDashboard;
