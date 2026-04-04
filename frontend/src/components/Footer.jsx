import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full py-6 bg-transparent border-t border-white/5 mt-auto">
      <div className="w-full max-w-[1200px] mx-auto px-8 flex justify-between items-center text-[0.8rem] text-white/30">
        <p>&copy; {new Date().getFullYear()} QuizMaster Platform. Built with React & Django.</p>
        
        <Link to="/login" className="flex items-center gap-2 text-white/30 no-underline transition-colors hover:text-slate-400">
          <Settings size={14} />
          <span>Admin Login</span>
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
