
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/UI/Navbar.jsx';
import AppRoutes from './routes.jsx';
import { useEffect } from 'react';
import './styles/App.css';
import { configureSocket, connectSocket, disconnectSocket } from './services/socket.js';
import {ToastContainer} from 'react-toastify';
const App = () => {
   useEffect(() => {
    configureSocket();
    connectSocket();

    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <AuthProvider>
      <Router> 
        <ToastContainer
          position="top-right"
          autoClose={3000}
          toastClassName="custom-toast"
        />
        <Navbar />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;