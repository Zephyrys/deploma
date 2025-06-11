import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
console.log(API_URL)
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token.replace(/"/g, '')}`;
  }
  console.log('➡️ Request:', config.method?.toUpperCase(), config.url, config.data || '');
  return config;
}, error => {
  console.error('❌ Request error:', error);
  return Promise.reject(error);
});

axios.interceptors.response.use(response => {
  console.log('✅ Response:', response.config.url, response.data);
  return response;
}, error => {
  console.error('🔴 Response error:', error.response?.data || error.message);
  return Promise.reject(error);
});

// ===== MOVIES / POSTERS =====

export const getMovies = async () => {
  try {
    const response = await axios.get(`${API_URL}/movies`, {
      timeout: 5000,
      headers: { 'Cache-Control': 'no-cache' }
    });
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data.message || 'Помилка при отриманні фільмів');
  }
};
export const sendUserRating = async (movieId, rating, userId) => {
  const res = await axios.post(`${API_URL}/movies/${movieId}/rate`, {
    rating,
    movieId,
    userId,
  });
  return res.data;
};

export const getMovieById = async (id) => {
  const response = await axios.get(`${API_URL}/movies/${id}`);
  return response.data;
};

export const createMovie = async (movieData) => {
  const response = await axios.post(`${API_URL}/movies`, movieData);
  return response.data;
};

export const updateMovie = async (id, movieData) => {
  const response = await axios.put(`${API_URL}/movies/${id}`, movieData);
  return response.data;
};

export const deleteMovie = async (id) => {
  const response = await axios.delete(`${API_URL}/movies/${id}`);
  return response.data;
};

export const uploadPoster = async (poster) => {
  const formData = new FormData();
  formData.append('poster', poster);
  console.log('⬆️ Uploading poster:', poster.name);

  const user = JSON.parse(localStorage.getItem('user'));
  const token = user?.token;

  try {
    const response = await axios.post(`${API_URL}/uploads`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('✅ Poster uploaded:', response.data);
    return response.data;
  } catch (err) {
    console.error('🔴 Poster upload error:', err.response?.data || err.message);
    throw err;
  }
};

// ===== SESSIONS =====

export const getSessions = async () => {
  const response = await axios.get(`${API_URL}/sessions`);
  return response.data;
};

export const getSessionById = async (id) => {
  const response = await axios.get(`${API_URL}/sessions/${id}`);
  return response.data;
};

export const createSession = async (sessionData) => {
  const response = await axios.post(`${API_URL}/sessions`, sessionData);
  return response.data;
};

export const updateSession = async (id, sessionData) => {
  const response = await axios.put(`${API_URL}/sessions/${id}`, sessionData);
  return response.data;
};

export const deleteSession = async (id) => {
  const response = await axios.delete(`${API_URL}/sessions/${id}`);
  return response.data;
};

// ===== BOOKINGS =====

export const createBooking = async (bookingData) => {
  const response = await axios.post(`${API_URL}/bookings`, bookingData);
  return response.data;
};

export const getUserBookings = async (userId) => {
  const response = await axios.get(`${API_URL}/bookings`, {
    params: { userId }
  });
  return response.data;
};
export const getBookings = async () => {
  const response = await axios.get(`${API_URL}/bookings`);
  return response.data;
};

export const deleteBooking = async (id) => {
  const response = await axios.delete(`${API_URL}/bookings/${id}`);
  return response.data;
};

// ===== HALLS =====

export const getHalls = async () => {
  const res = await axios.get(`${API_URL}/halls`);
  return res.data;
};

export const getHallById = async (id) => {
  const res = await axios.get(`${API_URL}/halls/${id}`);
  return res.data;
};

export const createHall = async (hallData) => {
  const res = await axios.post(`${API_URL}/halls`, hallData);
  return res.data;
};

export const updateHall = async (id, hallData) => {
  const res = await axios.put(`${API_URL}/halls/${id}`, hallData);
  return res.data;
};

export const deleteHall = async (id) => {
  const res = await axios.delete(`${API_URL}/halls/${id}`);
  return res.data;
};

// ===== CINEMAS =====

export const getCinemas = async () => {
  const res = await axios.get(`${API_URL}/cinemas`);
  return res.data;
};

export const getCinemaById = async (id) => {
  const res = await axios.get(`${API_URL}/cinemas/${id}`);
  return res.data;
};

export const createCinema = async (cinemaData) => {
  const res = await axios.post(`${API_URL}/cinemas`, cinemaData);
  return res.data;
};

export const updateCinema = async (id, cinemaData) => {
  const res = await axios.put(`${API_URL}/cinemas/${id}`, cinemaData);
  return res.data;
};

export const deleteCinema = async (id) => {
  const res = await axios.delete(`${API_URL}/cinemas/${id}`);
  return res.data;
};

// ===== USERS =====

export const getUsers = async () => {
  const res = await axios.get(`${API_URL}/users`);
  return res.data;
};

export const getUserById = async (id) => {
  const res = await axios.get(`${API_URL}/users/${id}`);
  return res.data;
};

export const updateUser = async (id, userData) => {
  const res = await axios.put(`${API_URL}/users/${id}`, userData);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await axios.delete(`${API_URL}/users/${id}`);
  return res.data;
};

// ===== PAYMENT =====

export const processPayment = async ({ bookingId, cardDetails, amount, selectedSeats }) => {
  const response = await axios.post(`${API_URL}/payments`, {
    bookingId, cardDetails, amount, selectedSeats
  });
  return response.data;
};

export const getPaymentStatus = async (paymentId) => {
  const response = await axios.get(`${API_URL}/payments/${paymentId}`);
  return response.data;
};

// ===== AUTH =====

export const loginUser = async (userData) => {
  const response = await axios.post(`${API_URL}/auth/login`, userData);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await axios.post(`${API_URL}/auth/register`, userData);
  return response.data;
};
// ===== TICKETS =====
export const getTickets = async (userId, token) => {
  try {
    const response = await axios.get(`${API_URL}/tickets`, {
      params: { userId },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data.message || 'Помилка при отриманні квитків');
  }
};