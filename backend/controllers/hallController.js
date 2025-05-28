const Hall = require('../models/Hall'); // або правильний шлях до твоєї моделі

// Отримати всі зали
exports.getAllHalls = async (req, res) => {
  try {
    const halls = await Hall.find();
    res.json(halls);
  } catch (error) {
    res.status(500).json({ message: 'Помилка при отриманні залів', error });
  }
};

// Отримати зал по ID
exports.getHallById = async (req, res) => {
  try {
    const hall = await Hall.findById(req.params.id);
    if (!hall) return res.status(404).json({ message: 'Зал не знайдено' });
    res.json(hall);
  } catch (error) {
    res.status(500).json({ message: 'Помилка при отриманні залу', error });
  }
};

// Створити новий зал
exports.createHall = async (req, res) => {
  try {
    const { name, seats } = req.body;
    const newHall = new Hall({ name, seats });
    await newHall.save();
    res.status(201).json(newHall);
  } catch (error) {
    res.status(400).json({ message: 'Помилка при створенні залу', error });
  }
};

// Оновити зал
exports.updateHall = async (req, res) => {
  try {
    const { name, seats } = req.body;
    const updated = await Hall.findByIdAndUpdate(
      req.params.id,
      { name, seats },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Зал не знайдено' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Помилка при оновленні залу', error });
  }
};

// Видалити зал
exports.deleteHall = async (req, res) => {
  try {
    const deleted = await Hall.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Зал не знайдено' });
    res.json({ message: 'Зал видалено' });
  } catch (error) {
    res.status(500).json({ message: 'Помилка при видаленні залу', error });
  }
};
