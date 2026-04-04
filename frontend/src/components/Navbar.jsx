import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BrainCircuit, ShieldAlert, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-[70px] bg-[#060913]/70 backdrop-blur-[20px] border-b border-white/10 z-[1000] flex items-center">
      <div className="w-full max-w-[1200px] mx-auto px-8 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 no-underline font-extrabold text-xl text-white tracking-tighter">
          <BrainCircuit size={28} className="text-[#6366f1]" />
          <span>QuizMaster</span>
        </Link>
        
        <div className="flex items-center gap-6">
          {user ? (
            <>
              {user.is_staff && (
                <Link to="/admin" className="text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 hover:text-amber-300 py-1.5 px-3.5 rounded-full flex items-center gap-2 font-medium text-[0.95rem] transition-colors">
                  <ShieldAlert size={18} />
                  <span>Admin Panel</span>
                </Link>
              )}
              <div className="flex items-center gap-2 bg-white/5 py-1.5 px-4 rounded-full font-semibold text-[0.9rem] border border-white/10 text-white">
                <User size={18} />
                <span>{user.username}</span>
              </div>
              <button onClick={handleLogout} className="bg-transparent border-none text-slate-400 hover:text-red-500 flex items-center gap-2 cursor-pointer font-medium text-[0.95rem] transition-colors">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-400 hover:text-white font-medium text-[0.95rem] transition-colors flex items-center gap-2">Log In</Link>
              <Link to="/signup" className="text-white bg-[#6366f1] hover:bg-[#4f46e5] shadow-lg shadow-[#6366f1]/40 py-2 px-5 rounded-full font-semibold text-sm transition-all">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
