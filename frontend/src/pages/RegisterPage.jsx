import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import '../styles/RegisterForm.css';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
const RegisterPage = () => {

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
 const location = useLocation();
  console.log('Отримані дані на сторінці оплати:', location.state);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser({ username, email, password });
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Помилка реєстрації');
    }
  };

  return (
    <div className="register-page">
      <h2>Реєстрація</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Ім'я користувача:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength="3"
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Пароль:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit">Зареєструватися</button>
      </form>
      <div>
        <p> Вже маєте обліковий запис?    
           <Link
                to={{ pathname: `/login` }}
              >Увійти
              </Link>
        </p>
             
      </div>

    </div>
  );
};

export default RegisterPage;