const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Будь ласка, заповніть всі обов\'язкові поля' 
      });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      console.log(`Спроба повторної реєстрації: ${field}=${existingUser[field]}`);
      return res.status(400).json({ 
        success: false,
        message: `Користувач з таким ${field} вже існує`
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword
    });

    await user.save();
    
    console.log(`Успішна реєстрація: ${user.email}`);
    res.status(201).json({ 
      success: true,
      message: 'Реєстрація успішна!',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    console.error('Помилка реєстрації:', err.message);
    res.status(500).json({ 
      success: false,
      message: err.message || 'Помилка сервера при реєстрації' 
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 10) // 10 годин
      },
      process.env.JWT_SECRET
    );
    console.log(token,  {
      id: user._id,
      email: user.email,
      role: user.role
    })
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
module.exports = { register, login };