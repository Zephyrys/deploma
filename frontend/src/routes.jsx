import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MoviePage from './pages/MoviePage';
import SessionsPage from './pages/SessionPage';
import SeatPage from './pages/Seatpage';
import TicketsPage from './pages/TicketsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/Routes/protectedRoute';
import AdminRoute from './components/Routes/AdminRoute';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccess from './pages/PaymentSuccessPage';
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/movies/:id" element={<MoviePage />} />
      <Route path="/sessions" element={<SessionsPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/seats/:sessionId" element={<SeatPage />} />
        <Route path="/payment/:sessionId" element={<PaymentPage />} />
        <Route path="/payment-success" element={<PaymentSuccess/>} />
          <Route path="/tickets" element={<TicketsPage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<AdminRoute />}>
        <Route path="/admin/*" element={<AdminPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;