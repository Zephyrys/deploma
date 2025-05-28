const Session = require('../models/Session');

// Функція для оновлення статусу сеансу
const updateSessionStatus = async (session) => {
  const now = new Date();

  if (session.startTime <= now && session.endTime > now) {
    session.status = 'active'; // Сеанс активний
  } else if (session.endTime <= now) {
    session.status = 'completed'; // Сеанс завершений
  } else {
    session.status = 'scheduled'; // Сеанс запланований
  }

  await session.save();
  return session;
};

// Функція для створення сеансу
const createSession = async (sessionData) => {
  const session = new Session(sessionData);
  await updateSessionStatus(session); // Оновлюємо статус перед збереженням
  return session;
};

// Функція для оновлення сеансу
const updateSession = async (sessionId, sessionData) => {
  const session = await Session.findByIdAndUpdate(sessionId, sessionData, { new: true });
  if (!session) {
    throw new Error('Session not found');
  }
  await updateSessionStatus(session); // Оновлюємо статус після оновлення
  return session;
};

module.exports = { createSession, updateSession };