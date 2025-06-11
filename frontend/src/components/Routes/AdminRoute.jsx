import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminRoute = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const isAuthorized = user && (user.role === 'admin' || user.role === 'manager');

  useEffect(() => {
    if (!isAuthorized) {
      toast.warning('Доступ дозволено лише адміністраторам або менеджерам');
    }
  }, [isAuthorized]);

  return (
    <>

      {isAuthorized ? <Outlet /> : <Navigate to="/" replace />}
    </>
  );
};

export default AdminRoute;
