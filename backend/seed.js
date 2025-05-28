const mongoose = require('mongoose');
const Movie = require('./models/Movie');
const Session = require('./models/Session');
const Booking = require('./models/Booking');
const User = require('./models/User');
const Poster = require('./models/Poster');
const Cinema = require('./models/Cinema');
const Hall = require('./models/Hall');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

// Підключення до MongoDB
mongoose.connect('mongodb+srv://admin:admin123@cluster0.x1witnz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

// Тестові дані
const testData = {
  cinemas: [
    {
      name: "Кінотеатр 'Сінема Сіті'",
      location: "м. Київ, вул. Хрещатик, 25",
      description: "Сучасний кінотеатр з 10 залами",
      contactInfo: "+380 44 123 45 67",
      openingHours: "Щодня з 10:00 до 23:00",
      city: "Київ",
    },
    {
      name: "Кінотеатр 'Мультиплекс'",
      location: "м. Львів, вул. Свободи, 15",
      description: "Кінотеатр з IMAX та 4D залами",
      contactInfo: "+380 32 456 78 90",
      openingHours: "Щодня з 09:00 до 22:00",
      city: "Львів",
    },
  ],
   halls: [
    {
      name: "Зал 1",
      seats: Array.from({length: 5}, () => 
        Array.from({length: 10}, () => ({
          isOccupied: false,
          userId: null
        }))
      ),
      amenities: ["3D", "IMAX"]
    },
    {
      name: "Зал 2", 
      seats: Array.from({length: 8}, () => 
        Array.from({length: 12}, () => ({
          isOccupied: false,
          userId: null
        }))
      ),
      amenities: ["4D"]
    }
  ],
  movies: [
    {
      title: "Inception",
      description: "A mind-bending thriller",
      genre: "Sci-Fi",
      duration: 148,
      releaseDate: new Date("2010-07-16"),
      rating: 9,
    },
    {
      title: "The Dark Knight",
      description: "A superhero classic",
      genre: "Action",
      duration: 152,
      releaseDate: new Date("2008-07-18"),
      rating: 9,
    },
  ],
  sessions: [
    {
      startTime: new Date("2023-12-25T18:00:00"),
      endTime: new Date("2023-12-25T20:28:00"),
      seatPrice: 150,
    },
    {
      startTime: new Date("2023-12-26T20:00:00"),
      endTime: new Date("2023-12-26T22:30:00"),
      seatPrice: 200,
    },
  ],
  users: [
    {
      username: "admin",
      email: 'admin@gmail.com',
      password: "admin123",
      role: "admin",
    },
    {
      username: "user1",
      email: 'user@gmail.com',
      password: "user123",
      role: "user",
    },
  ],
  posters: [
    {
      filename: "inception.webp",
      path: path.join(__dirname, 'uploads', 'images', 'inception.webp'),
      url: "http://localhost:5000/uploads/images/inception.webp",
      contentType: "image/webp",
    },
    {
      filename: "dark_knight.webp",
      path: path.join(__dirname, 'uploads', 'images', 'dark_knight.webp'),
      url: "http://localhost:5000/uploads/images/dark_knight.webp",
      contentType: "image/webp",
    },
  ],
  
};

// Заповнення бази даних
const seedDatabase = async () => {
  try {
    await Promise.all([
      Cinema.deleteMany(),
      Hall.deleteMany(),
      Movie.deleteMany(),
      Session.deleteMany(),
      User.deleteMany(),
      Poster.deleteMany(),
      Booking.deleteMany()
    ]);

    // 1. Створення кінотеатрів
    const cinemas = await Cinema.insertMany(testData.cinemas);
    console.log('Кінотеатри створені:', cinemas);

    // 2. Створення залів
    const halls = await Hall.insertMany([
      {...testData.halls[0], cinemaId: cinemas[0]._id},
      {...testData.halls[1], cinemaId: cinemas[1]._id}
    ]);
    console.log('Зали створені:', halls);

    // 3. Створення постерів
    const posters = await Poster.insertMany(testData.posters);
    console.log('Постери створені:', posters);

    // 4. Створення фільмів
    const movies = await Movie.insertMany([
      {...testData.movies[0], posterId: posters[0]._id},
      {...testData.movies[1], posterId: posters[1]._id}
    ]);
    console.log('Фільми створені:', movies);

    // 5. Створення сеансів
    const sessions = await Session.insertMany([
      {
        startTime: testData.sessions[0].startTime,
        endTime: testData.sessions[0].endTime,
        movieId: movies[0]._id,
        hallId: halls[0]._id,
        seats: halls[0].seats.map(row => 
          row.map(seat => ({
            isOccupied: seat.isOccupied,
            userId: seat.userId
          }))
        ),
        seatPrice: testData.sessions[0].seatPrice
      },
      {
        startTime: testData.sessions[1].startTime,
        endTime: testData.sessions[1].endTime,
        movieId: movies[1]._id,
        hallId: halls[1]._id,
        seats: halls[1].seats.map(row => 
          row.map(seat => ({
            isOccupied: seat.isOccupied,
            userId: seat.userId
          }))
        ),
        seatPrice: testData.sessions[1].seatPrice
      }
    ]);
    console.log('Сеанси створені:', sessions);

    // 6. Створення користувачів
    const users = await User.insertMany([
      {
        ...testData.users[0],
        password: await bcrypt.hash(testData.users[0].password, 10)
      },
      {
        ...testData.users[1],
        password: await bcrypt.hash(testData.users[1].password, 10)
      }
    ]);
    console.log('Користувачі створені:', users);

    // 7. Створення бронювань
    
    

    console.log('✅ Всі дані успішно додані!');
  } catch (err) {
    console.error('❌ Помилка заповнення бази:', err);
  } finally {
    mongoose.disconnect();
  }
};

seedDatabase();