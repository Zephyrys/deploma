import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const socket = io(SOCKET_URL, {
  reconnectionAttempts: 5,
  timeout: 5000,
  autoConnect: false,
  transports: ['websocket'],
});

const eventHandlers = new Map();

let connecting = false; 

export const connectSocket = () => {
  if (!socket.connected && !connecting) {
    connecting = true;      
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export const on = (event, handler) => {
  if (!eventHandlers.has(event)) {
    eventHandlers.set(event, new Set());
  }
  eventHandlers.get(event).add(handler);
  socket.on(event, handler);
};

export const off = (event, handler) => {
  if (eventHandlers.has(event)) {
    eventHandlers.get(event).delete(handler);
  }
  socket.off(event, handler);
};

export const emit = (event, data) => {
  socket.emit(event, data);
};

export const configureSocket = () => {
  socket.on('connect', () => {
    console.log('🟢 Підключено до сервера WebSocket');
    connecting = false;   
  });

  socket.on('disconnect', (reason) => {
    console.log('🔴 Відключено:', reason);
    connecting = false;  
    if (reason === 'io server disconnect') {
      socket.connect();
    }
  });

  socket.on('connect_error', (error) => {
    console.error('⚠️ Помилка підключення:', error.message);
    connecting = false;  
    setTimeout(() => socket.connect(), 5000);
  });

  socket.on('error', (error) => {
    console.error('⚠️ Помилка WebSocket:', error);
  });
};

export default socket;
