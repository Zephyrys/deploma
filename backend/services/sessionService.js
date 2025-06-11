const Session = require('../models/Session');

const updateSessionStatus = async (session) => {
  const now = new Date();

  if (session.startTime <= now && session.endTime > now) {
    session.status = 'active';
  } else if (session.endTime <= now) {
    session.status = 'completed';
  } else {
    session.status = 'scheduled'; 
  }

  await session.save();
  return session;
};

const createSession = async (sessionData) => {
  const session = new Session(sessionData);
  await updateSessionStatus(session);
  return session;
};

const updateSession = async (sessionId, sessionData) => {
  const session = await Session.findByIdAndUpdate(sessionId, sessionData, { new: true });
  if (!session) {
    throw new Error('Session not found');
  }
  await updateSessionStatus(session); 
  return session;
};

module.exports = { createSession, updateSession };