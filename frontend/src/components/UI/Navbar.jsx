import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setMenuOpen(prev => !prev);
  };

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" onClick={handleLinkClick}>Кінотеатр</Link>
      </div>

      <button className="navbar-toggle" onClick={toggleMenu} aria-label="Toggle menu">
        &#9776;
      </button>

      <ul className={`navbar-links ${menuOpen ? 'active' : ''}`}>
        <li>
          <Link to="/" onClick={handleLinkClick}>Головна</Link>
        </li>
        <li>
          <Link to="/sessions" onClick={handleLinkClick}>Сеанси</Link>
        </li>
        <li>
          <Link to="/tickets" onClick={handleLinkClick}>Квитки</Link>
        </li>
        {user ? (
          <>
            {(user.role === 'admin' || user.role === 'manager') && (
              <li>
                <Link to="/admin" onClick={handleLinkClick}>Адмін-панель</Link>
              </li>
            )}
            <li>
              <button onClick={() => { handleLogout(); handleLinkClick(); }}>Вийти</button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" onClick={handleLinkClick}>Увійти</Link>
            </li>
            <li>
              <Link to="/register" onClick={handleLinkClick}>Реєстрація</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
