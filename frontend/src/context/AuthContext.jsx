
import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const verifyToken = () => {
      const token = localStorage.getItem('token');
      console.log(token)
      if (!token) {
        logout();
        return;
      }
  
      try {
        const decoded = jwtDecode(token);
        
        if (!decoded.userId || !decoded.exp || decoded.exp * 1000 < Date.now()) {
          throw new Error('Невалідний токен');
        }
        
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
  
      } catch (err) {
        console.log(err)
        logout();
      }
    };
    
    verifyToken();
  }, []);

  const login = (response) => {
    try {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
      
      console.log('Успішний вхід:', response.user);
    } catch (err) {
      console.error('Помилка збереження даних:', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);