import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BrainCircuit, ShieldAlert, LogOut, User, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-[70px] bg-[#060913]/70 backdrop-blur-[20px] border-b border-white/10 z-[1000] flex items-center">
      <div className="w-full max-w-[1200px] mx-auto px-8 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 no-underline font-extrabold text-xl text-white tracking-tighter">
          <BrainCircuit size={28} className="text-[#6366f1]" />
          <span>QuizMaster</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              {user.is_staff && (
                <Link to="/admin" className="text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 hover:text-amber-300 py-1.5 px-3.5 rounded-full flex items-center gap-2 font-medium text-[0.95rem] transition-colors">
                  <ShieldAlert size={18} />
                  <span>Admin</span>
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

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-white hover:text-indigo-400 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[70px] left-0 right-0 bg-[#060913]/95 backdrop-blur-xl border-b border-white/10 p-6 flex flex-col gap-4 shadow-2xl animate-fade-in z-50">
          {user ? (
            <>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-white">
                <User size={20} className="text-indigo-400" />
                <span className="font-semibold">{user.username}</span>
              </div>
              {user.is_staff && (
                <Link onClick={() => setIsMobileMenuOpen(false)} to="/admin" className="p-3 text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 rounded-xl flex items-center gap-3 font-medium transition-colors">
                  <ShieldAlert size={20} />
                  <span>Admin Dashboard</span>
                </Link>
              )}
              <button onClick={handleLogout} className="p-3 w-full text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl flex items-center gap-3 font-medium transition-colors">
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/login" className="p-3 text-center text-slate-300 hover:text-white font-medium bg-white/5 hover:bg-white/10 rounded-xl transition-colors">Log In</Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/signup" className="p-3 text-center text-white bg-[#6366f1] hover:bg-[#4f46e5] shadow-lg shadow-[#6366f1]/40 rounded-xl font-semibold transition-colors">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
