import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import AppRoutes from './routes.jsx';
import './styles/App.css';
import { socket } from './services/socket.js';

const App = () => {
  
  socket
  return (
    <AuthProvider>
      <Router> 
        <Navbar />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;