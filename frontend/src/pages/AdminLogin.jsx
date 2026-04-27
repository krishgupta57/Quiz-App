import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Lock, User, AlertCircle, ShieldCheck, UserPlus, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.is_staff) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        // Admin Registration
        const res = await api.post('/accounts/signup/', {
          username,
          password,
          is_admin: true,
          secret_key: secretKey
        });
        
        localStorage.setItem('access_token', res.data.access);
        localStorage.setItem('refresh_token', res.data.refresh);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        toast.success(`Admin account created! Welcome, ${username}`);
        navigate('/admin/dashboard');
      } else {
        // Admin Login
        const tokenRes = await api.post('/accounts/login/', { username, password });
        localStorage.setItem('access_token', tokenRes.data.access);
        localStorage.setItem('refresh_token', tokenRes.data.refresh);
        
        const userRes = await api.get('/accounts/me/');
        const userData = userRes.data;
        
        if (!userData.is_staff) {
          toast.error("Access Denied: You are not an administrator.");
          localStorage.clear();
          setLoading(false);
          return;
        }

        localStorage.setItem('user', JSON.stringify(userData));
        toast.success(`Welcome back, Admin ${userData.username}!`);
        navigate('/admin/dashboard');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || err.response?.data?.detail || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#020617]">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="w-full max-w-md bg-[#0f172a]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 overflow-hidden">
        {/* Top Decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />

        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/10">
            {isRegister ? <UserPlus className="text-indigo-400" size={32} /> : <ShieldCheck className="text-indigo-400" size={32} />}
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {isRegister ? 'Admin Registration' : 'Admin Portal'}
          </h1>
          <p className="text-slate-400 mt-2">
            {isRegister ? 'Create a new authorized administrator account' : 'Secure access for administrators only'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex p-1 bg-black/40 rounded-2xl border border-white/5 mb-8">
          <button 
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${!isRegister ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Login
          </button>
          <button 
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${isRegister ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider ml-1">Username</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                <User size={18} />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                placeholder="Admin username"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider ml-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                placeholder="Admin password"
              />
            </div>
          </div>

          {isRegister && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider ml-1">Secret Admin Key</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <KeyRound size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="w-full bg-black/30 border border-indigo-500/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  placeholder="Enter master key"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all duration-300 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isRegister ? <UserPlus size={18} /> : <Lock size={18} />}
                <span>{isRegister ? 'Create Admin Account' : 'Verify & Login'}</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
          <AlertCircle className="text-amber-500 shrink-0" size={20} />
          <p className="text-xs text-amber-200/70 leading-relaxed">
            {isRegister 
              ? 'Registration requires a master key provided by the system owner. Unauthorized attempts are logged.' 
              : 'Unauthorized access attempts are logged. Standard student accounts will be redirected.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
