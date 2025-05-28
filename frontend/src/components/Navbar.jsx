import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Кінотеатр</Link>
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/">Головна</Link>
        </li>
        <li>
          <Link to="/sessions">Сеанси</Link> 
        </li>
        <li>
          <Link to="/tickets">Квитки</Link> 
        </li>
        {user ? (
          <>
            {user.role === 'admin' && (
              <li>
                <Link to="/admin">Адмін-панель</Link>
              </li>
            )}
            <li>
              <button onClick={logout}>Вийти</button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login">Увійти</Link>
            </li>
            <li>
              <Link to="/register">Реєстрація</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;