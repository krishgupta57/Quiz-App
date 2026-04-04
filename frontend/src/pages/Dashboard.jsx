import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Play, Award } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      
      <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl animate-fade-in w-full max-w-[600px] p-16 text-center">
        <div className="inline-flex bg-emerald-500/20 p-6 rounded-full mb-6">
          <Award size={48} className="text-emerald-500" />
        </div>
        
        <h1 className="text-4xl font-bold text-white tracking-tight mb-4">Ready to Test Your Knowledge?</h1>
        <p className="text-lg text-slate-400 mb-10 max-w-[400px] mx-auto leading-relaxed">
          Challenge yourself with our interactive quiz. Focus, think carefully, and see how high you can score!
        </p>

        <button 
          onClick={() => navigate('/quiz')} 
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-semibold py-4 px-10 rounded-full text-xl shadow-[0_4px_12px_rgba(99,102,241,0.3)] hover:shadow-[0_8px_20px_rgba(99,102,241,0.5)] hover:-translate-y-0.5 transition-all duration-300 active:translate-y-0"
        >
          <Play size={20} className="fill-current" />
          Start Quiz Now
        </button>
      </div>

    </div>
  );
};

export default Dashboard;
