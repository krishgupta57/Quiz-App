import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const token = localStorage.getItem('access_token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && (!user || !user.is_staff)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
