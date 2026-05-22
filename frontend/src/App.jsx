import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Components
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import StreakQuiz from './pages/StreakQuiz';
import QuizSession from './pages/QuizSession';
import Result from './pages/Result';
import ResultsHistory from './pages/ResultsHistory';


const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="flex flex-1 items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="flex flex-1 items-center justify-center text-white">Authenticating...</div>;
  if (!user || !user.is_staff) {
    return <Navigate to="/admin/login" />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="flex flex-1 items-center justify-center">Loading...</div>;
  if (user) {
    return user.is_staff ? <Navigate to="/admin" /> : <Navigate to="/" />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            },
          }} 
        />
        <Layout>
          <Routes>
            {/* Auth */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route path="/admin/login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
            
            {/* Student LMS Experience */}
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/quiz/:id" element={<PrivateRoute><QuizSession /></PrivateRoute>} />
            <Route path="/result" element={<PrivateRoute><Result /></PrivateRoute>} />
            <Route path="/results" element={<PrivateRoute><ResultsHistory /></PrivateRoute>} />
            
            {/* World Trivia Experience */}
            <Route path="/streak-mode" element={<PrivateRoute><StreakQuiz /></PrivateRoute>} />
            
            {/* Admin Stats & CMS */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

            {/* Redirects */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
