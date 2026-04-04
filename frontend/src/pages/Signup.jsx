import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, User, Lock, AlertCircle } from 'lucide-react';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl animate-fade-in w-full max-w-[400px] p-10">
        <div className="text-center mb-8">
          <div className="inline-flex bg-[#6366f1]/20 p-4 rounded-full mb-4">
            <UserPlus size={32} className="text-[#6366f1]" />
          </div>
          <h2 className="text-2xl font-bold text-white">Create Account</h2>
          <p className="mt-2 text-slate-400">Sign up to start taking quizzes</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg mb-6 flex items-center gap-2 text-red-500">
            <AlertCircle size={18} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-400 mb-2">Username</label>
            <div className="relative">
              <User size={18} className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Choose a username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                required 
              />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-500" />
              <input 
                type="password" 
                placeholder="Choose a password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                required 
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex justify-center mt-2 disabled:opacity-70 disabled:cursor-not-allowed" 
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-400">
          Already have an account? <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors ml-1">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
