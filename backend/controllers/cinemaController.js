const mongoose = require('mongoose');
const Cinema = require('../models/Cinema');

const getAllCinemas = async (req, res) => {
  try {
    const cinemas = await Cinema.find();
    res.status(200).json(cinemas);
  } catch (err) {
    console.error('[getAllCinemas] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCinemaById = async (req, res) => {
  try {
    const cinema = await Cinema.findById(req.params.id);
    if (!cinema) return res.status(404).json({ error: 'Cinema not found' });
    res.json(cinema);
  } catch (err) {
    console.error('[getCinemaById] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createCinema = async (req, res) => {
  try {
    const cinema = new Cinema(req.body);
    await cinema.save();
    res.status(201).json(cinema);
  } catch (err) {
    console.error('[createCinema] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateCinema = async (req, res) => {
  try {
    const cinema = await Cinema.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cinema) return res.status(404).json({ error: 'Cinema not found' });
    res.json(cinema);
  } catch (err) {
    console.error('[updateCinema] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteCinema = async (req, res) => {
  try {
    const cinema = await Cinema.findByIdAndDelete(req.params.id);
    if (!cinema) return res.status(404).json({ error: 'Cinema not found' });
    res.json({ message: 'Cinema deleted successfully' });
  } catch (err) {
    console.error('[deleteCinema] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllCinemas,
  getCinemaById,
  createCinema,
  updateCinema,
  deleteCinema,
};
