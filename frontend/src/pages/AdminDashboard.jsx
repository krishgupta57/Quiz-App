import { useState, useEffect } from 'react';
import api from '../api';
import { Users, FileQuestion, Trash2, PlusCircle, Check, LayoutDashboard, List } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'questions', 'users', 'add-question'
  
  // Dashboard / Attempts state
  const [attempts, setAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  // Users state
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Existing Questions state
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
  const [message, setMessage] = useState('');

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
      console.error(err);
    }
    setLoadingAttempts(false);
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get('/accounts/users/');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoadingUsers(false);
  };

  const fetchExistingQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const res = await api.get('/quiz/questions/');
      setExistingQuestions(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoadingQuestions(false);
  };

  const deleteUser = async (id) => {
    if(!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/accounts/users/${id}/`);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || "Error deleting user");
    }
  };

  const deleteQuestion = async (id) => {
    if(!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await api.delete(`/quiz/admin/questions/${id}/`);
      setExistingQuestions(existingQuestions.filter(q => q.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || "Error deleting question");
    }
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
    setSubmittingQ(true);
    setMessage('');
    
    // validate
    if (!questionText.trim() || choices.some(c => !c.text.trim())) {
      setMessage("Please fill out the question and all choices.");
      setSubmittingQ(false);
      return;
    }

    try {
      await api.post('/quiz/admin/questions/', {
        text: questionText,
        choices: choices
      });
      setMessage("Question added successfully!");
      setQuestionText('');
      setChoices([
        { text: '', is_correct: true },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false }
      ]);
      // automatically fetch to update list if we go back
      fetchExistingQuestions();
    } catch (err) {
      setMessage(err.response?.data?.error || "Error adding question.");
    }
    setSubmittingQ(false);
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 py-8 animate-fade-in flex-1">
      <div className="flex justify-center mb-8">
        <div className="flex flex-wrap justify-center bg-black/30 p-2 rounded-2xl border border-white/10 gap-2">
          <button 
            className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl text-[0.95rem] transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)]' : 'bg-transparent text-slate-400 hover:text-white'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} /> Student Marks
          </button>
          <button 
            className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl text-[0.95rem] transition-all duration-300 ${activeTab === 'questions' ? 'bg-indigo-600 text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)]' : 'bg-transparent text-slate-400 hover:text-white'}`}
            onClick={() => setActiveTab('questions')}
          >
            <List size={18} /> Manage Questions
          </button>
          <button 
            className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl text-[0.95rem] transition-all duration-300 ${activeTab === 'add-question' ? 'bg-indigo-600 text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)]' : 'bg-transparent text-slate-400 hover:text-white'}`}
            onClick={() => setActiveTab('add-question')}
          >
            <FileQuestion size={18} /> Add Question
          </button>
          <button 
            className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl text-[0.95rem] transition-all duration-300 ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)]' : 'bg-transparent text-slate-400 hover:text-white'}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} /> Manage Users
          </button>
        </div>
      </div>

      <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-[800px] mx-auto shadow-2xl">
        
        {activeTab === 'dashboard' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <LayoutDashboard className="text-indigo-400" /> Student Marks Dashboard
              </h2>
              <button 
                onClick={fetchAttempts} 
                className="text-sm px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition-colors border border-white/10"
              >
                Refresh
              </button>
            </div>

            {loadingAttempts ? <p className="text-slate-400">Loading marks...</p> : (
              <div className="overflow-x-auto w-full">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="py-4 text-slate-400 font-semibold tracking-wider text-sm uppercase">Student</th>
                      <th className="py-4 text-slate-400 font-semibold tracking-wider text-sm uppercase">Score</th>
                      <th className="py-4 text-slate-400 font-semibold tracking-wider text-sm uppercase">Percentage</th>
                      <th className="py-4 text-slate-400 font-semibold tracking-wider text-sm uppercase text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map(att => {
                      const perc = (att.score / att.total) * 100;
                      return (
                        <tr key={att.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 text-white font-medium">{att.username}</td>
                          <td className="py-4 text-indigo-400 font-bold">{att.score} / {att.total}</td>
                          <td className="py-4">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              perc >= 80 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                              perc >= 50 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 
                              'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {Math.round(perc)}%
                            </span>
                          </td>
                          <td className="py-4 text-slate-500 text-sm text-right">{att.created_at}</td>
                        </tr>
                      );
                    })}
                    {attempts.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center py-8 text-slate-500">No attempts recorded yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'questions' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <List className="text-indigo-400" /> Existing Questions
            </h2>

            {loadingQuestions ? <p className="text-slate-400">Loading questions...</p> : (
              <div className="flex flex-col gap-4">
                {existingQuestions.map(q => (
                  <div key={q.id} className="p-5 bg-white/5 border border-white/10 rounded-xl flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg text-white font-medium mb-2">{q.text}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {q.choices && q.choices.map(c => (
                          <span key={c.id} className={`text-xs px-2 py-1 rounded-md border ${c.is_correct ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-slate-400 border-white/10'}`}>
                            {c.text}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteQuestion(q.id)}
                      className="p-2 shrink-0 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Delete Question"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {existingQuestions.length === 0 && (
                  <p className="text-center py-8 text-slate-500">No questions found. Add some from the 'Add Question' tab.</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'add-question' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <PlusCircle className="text-indigo-400" /> Add New Question
            </h2>
            
            {message && (
              <div className="p-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg mb-6 shadow-sm">
                {message}
              </div>
            )}

            <form onSubmit={submitQuestion}>
              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Question Prompt</label>
                <input 
                  type="text" 
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter the question here..."
                  className="w-full py-4 px-5 bg-white/5 border border-white/10 rounded-xl text-white text-lg transition-all duration-300 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 placeholder:text-slate-600"
                />
              </div>

              <div className="mt-8 mb-4">
                <label className="block text-sm font-semibold text-slate-400 uppercase tracking-wider">Choices (Select the correct one)</label>
              </div>

              <div className="grid gap-4">
                {choices.map((choice, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <button 
                      type="button" 
                      onClick={() => setCorrectChoice(idx)}
                      className={`shrink-0 flex items-center justify-center h-10 w-10 rounded-full transition-all duration-200 border-2 ${
                        choice.is_correct 
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                          : 'bg-transparent border-white/10 text-transparent hover:border-slate-500'
                      }`}
                    >
                      {choice.is_correct && <Check size={18} />}
                    </button>
                    <input 
                      type="text" 
                      value={choice.text}
                      onChange={(e) => handleChoiceChange(idx, e.target.value)}
                      placeholder={`Choice ${idx + 1}`}
                      className={`flex-1 py-3 px-5 bg-white/5 border rounded-xl text-white transition-all duration-300 outline-none focus:ring-4 placeholder:text-slate-600 ${
                        choice.is_correct 
                          ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/20' 
                          : 'border-white/10 focus:border-indigo-500 focus:ring-indigo-500/20'
                      }`}
                    />
                  </div>
                ))}
              </div>

              <button 
                type="submit" 
                className="w-full mt-10 inline-flex items-center justify-center py-4 px-6 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-semibold rounded-xl text-lg transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:-translate-y-0 hover:-translate-y-0.5 active:translate-y-0" 
                disabled={submittingQ}
              >
                {submittingQ ? "Adding..." : "Save Question"}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Users className="text-indigo-400" /> Registered Profiles
            </h2>

            {loadingUsers ? <p className="text-slate-400">Loading users...</p> : (
              <div className="overflow-x-auto w-full">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="py-4 text-slate-400 font-semibold tracking-wider text-sm uppercase">ID</th>
                      <th className="py-4 text-slate-400 font-semibold tracking-wider text-sm uppercase">Username</th>
                      <th className="py-4 text-slate-400 font-semibold tracking-wider text-sm uppercase">Role</th>
                      <th className="py-4 text-slate-400 font-semibold tracking-wider text-sm uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 text-slate-400 font-mono">#{u.id}</td>
                        <td className="py-4 text-white font-medium">{u.username}</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            u.is_staff 
                              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' 
                              : 'bg-white/5 text-slate-400 border border-white/10'
                          }`}>
                            {u.is_staff ? 'Admin' : 'Student'}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => deleteUser(u.id)}
                            className="p-2 ml-auto text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            disabled={u.is_staff}
                            title={u.is_staff ? "Cannot delete staff" : "Delete User"}
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center py-8 text-slate-500">No users found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
