import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  reconnectionAttempts: 5,
  timeout: 5000,
  autoConnect: true,
  transports: ['websocket'],
});

// Видаляємо параметр store, якщо він не використовується
export const configureSocket = () => {
  socket.on('connect', () => {
    console.log('🟢 Підключено до сервера WebSocket');
  });

  socket.on('disconnect', (reason) => {
    console.log('🔴 Відключено:', reason);
    if (reason === 'io server disconnect') {
      socket.connect();
    }
  });

  socket.on('connect_error', (error) => {
    console.error('⚠️ Помилка підключення:', error.message);
    setTimeout(() => socket.connect(), 5000);
  });

  socket.on('error', (error) => {
    console.error('⚠️ Помилка WebSocket:', error);
  });
};