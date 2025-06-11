import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/LoginForm.css';
import { Link } from 'react-router-dom';
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const { token, user } = await loginUser({ email, password });
      login({ token, user }); 
      navigate('/');
    } catch (err) {
      setError(err.message || 'Невірний email або пароль');
    }
  };

  return (
    <div className="login-page">
      <h2>Вхід</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            required
          />
        </div>
        <div className="form-group">
          <label>Пароль:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" className="submit-button">
          Увійти
        </button>
      </form>
      <div>
        <p> Ще не маєте обілоково запису?    
           <Link
                to={{ pathname: `/register` }}
              >Зареєструватись
              </Link>
        </p>
             
      </div>
    </div>
  );
};

export default LoginPage;