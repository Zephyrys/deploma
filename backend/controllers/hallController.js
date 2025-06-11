const mongoose = require('mongoose');
const Hall = require('../models/Hall');

const getAllHalls = async (req, res) => {
  try {
    const halls = await Hall.find().populate('cinemaId', 'name location');
    res.status(200).json(halls);
  } catch (err) {
    console.error('[getAllHalls] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getHallById = async (req, res) => {
  try {
    const hall = await Hall.findById(req.params.id).populate('cinemaId', 'name location');
    if (!hall) return res.status(404).json({ error: 'Hall not found' });
    res.json(hall);
  } catch (err) {
    console.error('[getHallById] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createHall = async (req, res) => {
  try {
    const hall = new Hall(req.body);
    await hall.save();
    res.status(201).json(hall);
  } catch (err) {
    console.error('[createHall] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateHall = async (req, res) => {
  try {
    const hall = await Hall.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!hall) return res.status(404).json({ error: 'Hall not found' });
    res.json(hall);
  } catch (err) {
    console.error('[updateHall] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteHall = async (req, res) => {
  try {
    const hall = await Hall.findByIdAndDelete(req.params.id);
    if (!hall) return res.status(404).json({ error: 'Hall not found' });
    res.json({ message: 'Hall deleted successfully' });
  } catch (err) {
    console.error('[deleteHall] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllHalls,
  getHallById,
  createHall,
  updateHall,
  deleteHall,
};

