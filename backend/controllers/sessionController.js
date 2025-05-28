const Session = require('../models/Session');
const sessionService = require('../services/sessionService');
const Hall = require('../models/Hall'); // Додати імпорт
const Cinema = require('../models/Cinema'); // Додати імпорт

const createSession = async (req, res) => {
  try {
    const hall = await Hall.findById(req.body.hallId);
    if (!hall) throw new Error("Hall not found");
    
    const session = await Session.create({
      ...req.body,
      seats: hall.seats.map(row => [...row])
    });

    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({message: err.message});
  }
};

const updateSession = async (req, res) => {
  try {
    const session = await sessionService.updateSession(req.params.id, req.body);
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: 'Error updating session' });
  }
};
const getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find().populate('movieId');
    console.log('Getting sessions: ', sessions)
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sessions' });
  }
};

const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('movieId')
      .populate({
        path: 'hallId',
        populate: { path: 'cinemaId' }
      });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Переконуємося, що seats існують у відповіді
    const sessionData = session.toObject();
    if (!sessionData.seats) {
      sessionData.seats = session.hallId.seats; // Резервний варіант
    }

    res.json(sessionData);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching session' });
  }
};

// В контролері сеансів (sessionController.js)
const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate('movieId')
      .populate({
        path: 'hallId',
        model: 'Hall', // Вказуємо явно модель
        populate: {
          path: 'cinemaId',
          model: 'Cinema' // Вказуємо явно модель
        }
      });

    res.json(sessions);
  } catch (err) {
    console.error('Помилка в getSessions:', err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};
const deleteSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json({ message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting session' });
  }
};
const deleteSessionsByMovieId = async (movieId) => {
  try {
    const result = await Session.deleteMany({ movieId });
    console.log(`Deleted ${result.deletedCount} sessions for movie ${movieId}`);
  } catch (err) {
    console.error('Error deleting sessions by movieId:', err);
    throw new Error('Error deleting related sessions');
  }
};
module.exports={getAllSessions,getSessionById,createSession,updateSession,deleteSession,getSessions,  deleteSessionsByMovieId}