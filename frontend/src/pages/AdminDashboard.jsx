import { useState, useEffect } from 'react';
import api from '../api';
import { Users, FileQuestion, Trash2, PlusCircle, Check, LayoutDashboard, List, RefreshCw, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  
  // States
  const [attempts, setAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [existingQuestions, setExistingQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Question form state
  const [questionText, setQuestionText] = useState('');
  const [choices, setChoices] = useState([
    { text: '', is_correct: true },
    { text: '', is_correct: false },
    { text: '', is_correct: false },
    { text: '', is_correct: false }
  ]);
  const [submittingQ, setSubmittingQ] = useState(false);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'dashboard') fetchAttempts();
    if (activeTab === 'questions') fetchExistingQuestions();
  }, [activeTab]);

  const fetchAttempts = async () => {
    setLoadingAttempts(true);
    try {
      const res = await api.get('/quiz/admin/attempts/');
      setAttempts(res.data);
    } catch (err) {
      toast.error("Failed to fetch student marks");
    } finally {
      setLoadingAttempts(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get('/accounts/users/');
      setUsers(res.data);
    } catch (err) {
      toast.error("Failed to fetch user list");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchExistingQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const res = await api.get('/quiz/questions/');
      setExistingQuestions(res.data);
    } catch (err) {
      toast.error("Failed to fetch questions");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const deleteUser = async (id) => {
    toast.promise(
      api.delete(`/accounts/users/${id}/`),
      {
        loading: 'Deleting user...',
        success: () => {
          setUsers(users.filter(u => u.id !== id));
          return 'User deleted successfully';
        },
        error: (err) => err.response?.data?.error || 'Error deleting user',
      }
    );
  };

  const deleteQuestion = async (id) => {
    toast.promise(
      api.delete(`/quiz/admin/questions/${id}/`),
      {
        loading: 'Deleting question...',
        success: () => {
          setExistingQuestions(existingQuestions.filter(q => q.id !== id));
          return 'Question removed';
        },
        error: 'Error deleting question',
      }
    );
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out from Admin Portal");
    navigate('/admin/login');
  };

  const handleChoiceChange = (index, value) => {
    const newChoices = [...choices];
    newChoices[index].text = value;
    setChoices(newChoices);
  };

  const setCorrectChoice = (index) => {
    const newChoices = choices.map((c, i) => ({
      ...c,
      is_correct: i === index
    }));
    setChoices(newChoices);
  };

  const submitQuestion = async (e) => {
    e.preventDefault();
    if (!questionText.trim() || choices.some(c => !c.text.trim())) {
      toast.error("Please complete all fields");
      return;
    }

    setSubmittingQ(true);
    try {
      await api.post('/quiz/admin/questions/', {
        text: questionText,
        choices: choices
      });
      toast.success("Question published successfully!");
      setQuestionText('');
      setChoices([
        { text: '', is_correct: true },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false }
      ]);
      fetchExistingQuestions();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add question");
    } finally {
      setSubmittingQ(false);
    }
  };

  const tabVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 py-8 animate-fade-in flex-1">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 bg-[#0f172a]/40 p-6 rounded-3xl border border-white/5 backdrop-blur-sm">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Admin Command Center</h1>
          <p className="text-slate-400 mt-1">Manage questions, students and results</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all border border-red-500/20 text-sm font-semibold"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="flex justify-center mb-12">
        <div className="flex flex-wrap justify-center bg-black/30 p-1.5 rounded-2xl border border-white/10 gap-1 shadow-inner">
          {[
            { id: 'dashboard', label: 'Student Marks', icon: LayoutDashboard },
            { id: 'questions', label: 'Manage Bank', icon: List },
            { id: 'add-question', label: 'New Question', icon: PlusCircle },
            { id: 'users', label: 'User Profiles', icon: Users },
          ].map(tab => (
            <button 
              key={tab.id}
              className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl text-[0.9rem] transition-all duration-300 ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-[0_4px_15px_rgba(99,102,241,0.4)] scale-[1.02]' : 'bg-transparent text-slate-400 hover:text-white'}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={17} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[900px] mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="bg-[#0f172a]/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-16 -mt-16 pointer-events-none" />
            
            {activeTab === 'dashboard' && (
              <div className="relative">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                      <LayoutDashboard size={20} />
                    </div>
                    Student Performance
                  </h2>
                  <button 
                    onClick={fetchAttempts} 
                    className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl transition-all border border-white/10 hover:rotate-180 duration-500"
                    disabled={loadingAttempts}
                  >
                    <RefreshCw size={18} className={loadingAttempts ? 'animate-spin' : ''} />
                  </button>
                </div>

                <div className="overflow-x-auto w-full">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="pb-4 text-slate-400 font-semibold tracking-wider text-xs uppercase">Student</th>
                        <th className="pb-4 text-slate-400 font-semibold tracking-wider text-xs uppercase">Raw Score</th>
                        <th className="pb-4 text-slate-400 font-semibold tracking-wider text-xs uppercase">Status</th>
                        <th className="pb-4 text-slate-400 font-semibold tracking-wider text-xs uppercase text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {attempts.map(att => {
                        const perc = (att.score / att.total) * 100;
                        return (
                          <tr key={att.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="py-5 text-white font-medium group-hover:text-indigo-300 transition-colors">{att.username}</td>
                            <td className="py-5 text-indigo-400 font-bold">{att.score} <span className="text-slate-600 font-normal">/ {att.total}</span></td>
                            <td className="py-5">
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1 text-[0.7rem] font-bold rounded-full border ${
                                perc >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                perc >= 50 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                                'bg-red-500/10 text-red-400 border-red-500/20'
                              }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${perc >= 80 ? 'bg-emerald-400' : perc >= 50 ? 'bg-amber-400' : 'bg-red-400'}`} />
                                {Math.round(perc)}% PASS
                              </div>
                            </td>
                            <td className="py-5 text-slate-500 text-xs text-right font-mono">{att.created_at}</td>
                          </tr>
                        );
                      })}
                      {attempts.length === 0 && !loadingAttempts && (
                        <tr>
                          <td colSpan="4" className="text-center py-12 text-slate-500 italic">No student attempts recorded yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'questions' && (
              <div className="relative">
                <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                    <List size={20} />
                  </div>
                  Question Bank
                </h2>

                <div className="flex flex-col gap-4">
                  {existingQuestions.map((q, idx) => (
                    <motion.div 
                      key={q.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.05 } }}
                      className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl flex justify-between items-start gap-4 hover:border-white/10 transition-colors group"
                    >
                      <div className="flex-1">
                        <span className="text-[0.65rem] font-bold text-indigo-500 uppercase tracking-widest mb-1 block">Question #{q.id}</span>
                        <h3 className="text-lg text-white font-medium mb-4 leading-relaxed">{q.text}</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {q.choices && q.choices.map(c => (
                            <div key={c.id} className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl border ${c.is_correct ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-black/20 text-slate-500 border-white/5'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${c.is_correct ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                              {c.text}
                            </div>
                          ))}
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteQuestion(q.id)}
                        className="p-3 shrink-0 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                      >
                        <Trash2 size={20} />
                      </button>
                    </motion.div>
                  ))}
                  {existingQuestions.length === 0 && !loadingQuestions && (
                    <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
                      <p className="text-slate-500">Your question bank is empty.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'add-question' && (
              <div className="relative">
                <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                    <PlusCircle size={20} />
                  </div>
                  Author New Question
                </h2>
                
                <form onSubmit={submitQuestion} className="space-y-10">
                  <div className="space-y-3">
                    <label className="block text-[0.7rem] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">The Question</label>
                    <textarea 
                      rows="3"
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="Type the question prompt here..."
                      className="w-full py-4 px-6 bg-black/40 border border-white/10 rounded-2xl text-white text-lg transition-all duration-300 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-700 resize-none"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[0.7rem] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Answer Options</label>
                    <div className="grid gap-4">
                      {choices.map((choice, idx) => (
                        <div key={idx} className="flex items-center gap-4 group">
                          <button 
                            type="button" 
                            onClick={() => setCorrectChoice(idx)}
                            className={`shrink-0 flex items-center justify-center h-12 w-12 rounded-2xl transition-all duration-300 border-2 ${
                              choice.is_correct 
                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_4px_15px_rgba(16,185,129,0.4)] scale-110' 
                                : 'bg-black/40 border-white/10 text-transparent hover:border-slate-600'
                            }`}
                          >
                            <Check size={20} className={choice.is_correct ? 'opacity-100' : 'opacity-0'} />
                          </button>
                          <input 
                            type="text" 
                            value={choice.text}
                            onChange={(e) => handleChoiceChange(idx, e.target.value)}
                            placeholder={`Choice option ${idx + 1}`}
                            className={`flex-1 py-4 px-6 bg-black/40 border rounded-2xl text-white transition-all duration-300 outline-none focus:ring-4 placeholder:text-slate-700 ${
                              choice.is_correct 
                                ? 'border-emerald-500/40 focus:border-emerald-500 focus:ring-emerald-500/10' 
                                : 'border-white/10 focus:border-indigo-500 focus:ring-indigo-500/10'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full flex items-center justify-center gap-3 py-5 px-8 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-2xl text-lg transition-all duration-300 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed" 
                    disabled={submittingQ}
                  >
                    {submittingQ ? (
                      <RefreshCw className="animate-spin" size={20} />
                    ) : (
                      <>
                        <Check size={20} />
                        <span>Publish Question</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="relative">
                <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                    <Users size={20} />
                  </div>
                  System User Directory
                </h2>

                <div className="overflow-x-auto w-full">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="pb-4 text-slate-400 font-semibold tracking-wider text-xs uppercase">Identifier</th>
                        <th className="pb-4 text-slate-400 font-semibold tracking-wider text-xs uppercase">Username</th>
                        <th className="pb-4 text-slate-400 font-semibold tracking-wider text-xs uppercase">Security Role</th>
                        <th className="pb-4 text-slate-400 font-semibold tracking-wider text-xs uppercase text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="py-5 text-slate-500 font-mono text-xs">ID_{u.id.toString().padStart(4, '0')}</td>
                          <td className="py-5 text-white font-medium group-hover:text-indigo-300 transition-colors">{u.username}</td>
                          <td className="py-5">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[0.65rem] font-bold rounded-full border uppercase tracking-wider ${
                              u.is_staff 
                                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                                : 'bg-white/5 text-slate-400 border-white/10'
                            }`}>
                              {u.is_staff ? 'Administrator' : 'Student Account'}
                            </span>
                          </td>
                          <td className="py-5 text-right">
                            <button 
                              onClick={() => deleteUser(u.id)}
                              className="p-2.5 ml-auto text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed border border-transparent hover:border-red-500/20"
                              disabled={u.is_staff}
                            >
                              <Trash2 size={18} />
                            </button>
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
