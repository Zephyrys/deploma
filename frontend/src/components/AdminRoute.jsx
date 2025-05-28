// AdminRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const user = JSON.parse(localStorage.getItem('user')); // Ваша логіка перевірки адміна
  const isAdmin = user?.role === 'admin';
  
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;