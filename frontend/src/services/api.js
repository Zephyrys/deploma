// // import axios from 'axios';
// // // ** GLOBAL VARIABLES
// // const API_URL = 'http://localhost:5000/api';
// // axios.interceptors.request.use(config => {
// //   const token = localStorage.getItem('token');
// //   if (token) {
// //     config.headers.Authorization = `Bearer ${token.replace(/"/g, '')}`;
// //   }
// //   return config;
// // });






// // // *------------------------------==SESSIONS==-----------------------------------------------
// // // *-----------------------------------GET SESSION------------------------------------------
// // export const getSessions = async () => {
// //   console.log('запит на Сесії')
// //     const response = await axios.get(`${API_URL}/sessions`);
    
// //   return response.data;
// // };

// // // *-----------GET SESSION---BY---ID-------------------------------
// // export const getSessionById = async (id) => {
// //   const response = await axios.get(`${API_URL}/sessions/${id}`);
// //   return response.data;
// // };


// // // *------------------------------BOOKINGS-------------------------------------
// // // *-------------------------------CREATE BOOKING------------------------------------------
// // export const createBooking = async (bookingData) => {
// //   const response = await axios.post(`${API_URL}/bookings`, bookingData);
// //   return response.data;
// // };



// // // *------------------------------==PAYMENT==----------------------------------------
// // // *------------------------PROCESS PAYMENT-------------------------------------------
// // export const processPayment = async ({ bookingId, cardDetails, amount, selectedSeats }) => {
// //   try {
// //     const response = await axios.post(`${API_URL}/payments`, {
// //       bookingId,
// //       cardDetails,
// //       amount,
// //       selectedSeats
// //     });
// //     return response.data;
// //   } catch (err) {
// //     const message =
// //       err.response?.data?.message ||
// //       err.response?.data?.error ||
// //       'Помилка при обробці платежу';
// //     throw new Error(message);
// //   }
// // };
// // // *********************==AUTH==*******************************
// // // *-------------------------LOGIN----------------------------
// // export const loginUser = async (userData) => {
// //   try {
// //     const response = await axios.post(`${API_URL}/auth/login`, userData);
// //     if (!response.data.token || !response.data.user) {
// //       throw new Error('Невірний формат відповіді сервера');
// //     }

// //     return {
// //       token: response.data.token,
// //       user: response.data.user
// //     };

// //   } catch (err) {
// //     throw new Error(err.response?.data?.message || 'Помилка входу');
// //   }
// // };

// // // *--------------------REGISTER----------------------------
// // export const registerUser = async (userData) => {
// //   try {
// //     const response = await axios.post(`${API_URL}/auth/register`, userData, {
// //       headers: {
// //         'Content-Type': 'application/json'
// //       }
// //     });
// //     return response.data;
// //   } catch (err) {
// //     const errorMessage = err.response?.data?.message || 'Помилка реєстрації';
// //     throw new Error(errorMessage);
// //   }
// // };
// // // *****************************************************************



// // // TODO ==========================ADMIN===PANEL=============================
// // // ? -----------------DELETE----------MOVIES--------------------------------
// // export const deleteMovie = async (id) => {
// //   const response = await axios.delete(`${API_URL}/movies/${id}`);
// //   return response.data;
// // };
// // export const updateMovie = async (id, movieData) => {
// //     const response = await axios.put(`${API_URL}/movies/${id}`, movieData, {
// //       headers: {
// //         'Content-Type': 'application/json',
// //         Authorization: `Bearer ${localStorage.getItem('token')}`, // Додаємо токен для авторизації
// //       },
// //     });
// //     return response.data;
// //   };
// //   export const reserveSeats = async (sessionId, seats, amount) => {
// //     const token = localStorage.getItem('token');
// //     try {
// //       const response = await axios.post(
// //         `${API_URL}/bookings`,
// //         {
// //           sessionId,
// //           seats: seats.map(({ row, seat }) => ({ row, seat })),
// //           amount
// //         },
// //         {
// //           headers: {
// //             Authorization: `Bearer ${token}`,
// //             'Content-Type': 'application/json'
// //           }
// //         }
// //       );
// //       return response.data;
// //     } catch (err) {
// //       throw new Error(err.response?.data?.message || 'Помилка бронювання');
// //     }
// //   };
// // // *-----------------------------GET---------MOVIES----------------------------
// // export const getMovies = async () => {
// //   try {
// //     const response = await axios.get(`${API_URL}/movies`, {
// //       timeout: 5000, // Таймаут 5 секунд
// //       headers: {
// //         'Cache-Control': 'no-cache'
// //       }
// //     });
// //     return response.data;
// //   } catch (err) {
// //     if (err.response) {
// //       // Сервер відповів з кодом помилки
// //       throw new Error(err.response.data.message || 'Помилка сервера');
// //     } else if (err.request) {
// //       // Запит був зроблений, але відповіді не отримано
// //       throw new Error('Не вдалося отримати відповідь від сервера');
// //     } else {
// //       // Щось сталося під час налаштування запиту
// //       throw new Error('Помилка при налаштуванні запиту');
// //     }
// //   }
// // };
// // // *------------------------GET----MOVIES-----BY---ID----------------
// // export const getMovieById = async (id) => {
// //   const response = await axios.get(`${API_URL}/movies/${id}`);
// //   return response.data;
// // };
// import axios from 'axios';

// // ** GLOBAL VARIABLES
// const API_URL = 'http://localhost:5000/api';

// axios.interceptors.request.use(config => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token.replace(/"/g, '')}`;
//   }
//   return config;
// });

// // *------------------------------==SESSIONS==-----------------------------------------------
// // *-----------------------------------GET SESSION------------------------------------------
// export const getSessions = async () => {
//   console.log('📡 [GET] Отримання всіх сесій');
//   const response = await axios.get(`${API_URL}/sessions`);
//   console.log('✅ Сесії отримано:', response.data);
//   return response.data;
// };

// // *-----------GET SESSION---BY---ID-------------------------------
// export const getSessionById = async (id) => {
//   console.log(`📡 [GET] Сесія за ID: ${id}`);
//   const response = await axios.get(`${API_URL}/sessions/${id}`);
//   console.log('✅ Сесію отримано:', response.data);
//   return response.data;
// };

// // *------------------------------BOOKINGS-------------------------------------
// // *-------------------------------CREATE BOOKING------------------------------------------
// export const createBooking = async (bookingData) => {
//   console.log('📡 [POST] Створення бронювання:', bookingData);
//   const response = await axios.post(`${API_URL}/bookings`, bookingData);
//   console.log('✅ Бронювання створено:', response.data);
//   return response.data;
// };

// // *------------------------------==PAYMENT==----------------------------------------
// // *------------------------PROCESS PAYMENT-------------------------------------------
// export const processPayment = async ({ bookingId, cardDetails, amount, selectedSeats }) => {
//   console.log('📡 [POST] Обробка платежу:', {
//     bookingId, cardDetails, amount, selectedSeats
//   });
//   try {
//     const response = await axios.post(`${API_URL}/payments`, {
//       bookingId,
//       cardDetails,
//       amount,
//       selectedSeats
//     });
//     console.log('✅ Платіж успішно оброблено:', response.data);
//     return response.data;
//   } catch (err) {
//     const message =
//       err.response?.data?.message ||
//       err.response?.data?.error ||
//       'Помилка при обробці платежу';
//     console.error('❌ Помилка платежу:', message);
//     throw new Error(message);
//   }
// };

// // *********************==AUTH==*******************************
// // *-------------------------LOGIN----------------------------
// export const loginUser = async (userData) => {
//   console.log('📡 [POST] Вхід користувача:', userData);
//   try {
//     const response = await axios.post(`${API_URL}/auth/login`, userData);
//     if (!response.data.token || !response.data.user) {
//       throw new Error('Невірний формат відповіді сервера');
//     }
//     console.log('✅ Вхід успішний:', response.data.user);
//     return {
//       token: response.data.token,
//       user: response.data.user
//     };
//   } catch (err) {
//     console.error('❌ Помилка входу:', err.response?.data?.message || err.message);
//     throw new Error(err.response?.data?.message || 'Помилка входу');
//   }
// };

// // *--------------------REGISTER----------------------------
// export const registerUser = async (userData) => {
//   console.log('📡 [POST] Реєстрація користувача:', userData);
//   try {
//     const response = await axios.post(`${API_URL}/auth/register`, userData, {
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     });
//     console.log('✅ Реєстрація успішна:', response.data);
//     return response.data;
//   } catch (err) {
//     const errorMessage = err.response?.data?.message || 'Помилка реєстрації';
//     console.error('❌ Помилка реєстрації:', errorMessage);
//     throw new Error(errorMessage);
//   }
// };

// // TODO ==========================ADMIN===PANEL=============================
// //* -----------------DELETE----------MOVIES--------------------------------
// export const deleteMovie = async (id) => {
//   console.log(`🗑️ [DELETE] Видалення фільму ID: ${id}`);
//   const response = await axios.delete(`${API_URL}/movies/${id}`);
//   console.log('✅ Фільм видалено:', response.data);
//   return response.data;
// };

// export const updateMovie = async (id, movieData) => {
//   console.log(`📝 [PUT] Оновлення фільму ID: ${id}`, movieData);
//   const response = await axios.put(`${API_URL}/movies/${id}`, movieData, {
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${localStorage.getItem('token')}`,
//     },
//   });
//   console.log('✅ Фільм оновлено:', response.data);
//   return response.data;
// };

// // ????
// export const reserveSeats = async (sessionId, seats, amount) => {
//   const token = localStorage.getItem('token');
//   const payload = {
//     sessionId,
//     seats: seats.map(({ row, seat }) => ({ row, seat })),
//     amount
//   };
//   console.log('📡 [POST] Резервування місць:', payload);
//   try {
//     const response = await axios.post(`${API_URL}/bookings`, payload, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       }
//     });
//     console.log('✅ Місця зарезервовано:', response.data);
//     return response.data;
//   } catch (err) {
//     const msg = err.response?.data?.message || 'Помилка бронювання';
//     console.error('❌ Помилка резервування:', msg);
//     throw new Error(msg);
//   }
// };

// // *-----------------------------GET---------MOVIES----------------------------
// export const getMovies = async () => {
//   console.log('📡 [GET] Отримання списку фільмів');
//   try {
//     const response = await axios.get(`${API_URL}/movies`, {
//       timeout: 5000,
//       headers: {
//         'Cache-Control': 'no-cache'
//       }
//     });
//     console.log('✅ Фільми отримано:', response.data);
//     return response.data;
//   } catch (err) {
//     if (err.response) {
//       console.error('❌ Помилка сервера:', err.response.data.message);
//       throw new Error(err.response.data.message || 'Помилка сервера');
//     } else if (err.request) {
//       console.error('❌ Немає відповіді від сервера');
//       throw new Error('Не вдалося отримати відповідь від сервера');
//     } else {
//       console.error('❌ Помилка при налаштуванні запиту');
//       throw new Error('Помилка при налаштуванні запиту');
//     }
//   }
// };

// // *------------------------GET----MOVIES-----BY---ID----------------
// export const getMovieById = async (id) => {
//   console.log(`📡 [GET] Отримання фільму за ID: ${id}`);
//   const response = await axios.get(`${API_URL}/movies/${id}`);
//   console.log('✅ Фільм отримано:', response.data);
//   return response.data;
// };
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token.replace(/"/g, '')}`;
  }
  return config;
});
// *-----------------------------GET---------MOVIES----------------------------
export const getMovies = async () => {
  try {
    const response = await axios.get(`${API_URL}/movies`, {
      timeout: 5000, // Таймаут 5 секунд
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    return response.data;
  } catch (err) {
    if (err.response) {
      // Сервер відповів з кодом помилки
      throw new Error(err.response.data.message || 'Помилка сервера');
    } else if (err.request) {
      // Запит був зроблений, але відповіді не отримано
      throw new Error('Не вдалося отримати відповідь від сервера');
    } else {
      // Щось сталося під час налаштування запиту
      throw new Error('Помилка при налаштуванні запиту');
    }
  }
};
// *------------------------GET----MOVIES-----BY---ID----------------
export const getMovieById = async (id) => {
  const response = await axios.get(`${API_URL}/movies/${id}`);
  return response.data;
};
// ===== MOVIES / POSTERS =====

// Отримати всі фільми
// export const getMovies = async () => {
//   const response = await axios.get(`${API_URL}/movies`);
//   return response.data;
// };

// // Отримати фільм за ID
// export const getMovieById = async (id) => {
//   const response = await axios.get(`${API_URL}/movies/${id}`);
//   return response.data;
// };

// Створити фільм
export const createMovie = async (movieData) => {
  const response = await axios.post(`${API_URL}/movies`, movieData);
  return response.data;
};

// Оновити фільм
export const updateMovie = async (id, movieData) => {
  const response = await axios.put(`${API_URL}/movies/${id}`, movieData);
  return response.data;
};

// Видалити фільм
export const deleteMovie = async (id) => {
  const response = await axios.delete(`${API_URL}/movies/${id}`);
  return response.data;
};

// Завантажити постер
export const uploadPoster = async (poster) => {
  const formData = new FormData();
  formData.append('poster', poster);
  console.log(poster)
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
    console.error('🔴 Upload failed:', err.response?.data || err.message);
    throw err;
  }
};

// ===== SESSIONS =====

// Отримати всі сеанси
export const getSessions = async () => {
  const response = await axios.get(`${API_URL}/sessions`);
  return response.data;
};

// Отримати сеанс за ID
export const getSessionById = async (id) => {
  const response = await axios.get(`${API_URL}/sessions/${id}`);
  return response.data;
};

// Створити сеанс
export const createSession = async (sessionData) => {
  const response = await axios.post(`${API_URL}/sessions`, sessionData);
  return response.data;
};

// Оновити сеанс
export const updateSession = async (id, sessionData) => {
  const response = await axios.put(`${API_URL}/sessions/${id}`, sessionData);
  return response.data;
};

// Видалити сеанс
export const deleteSession = async (id) => {
  const response = await axios.delete(`${API_URL}/sessions/${id}`);
  return response.data;
};

// ===== BOOKINGS =====

// Створити бронювання
export const createBooking = async (bookingData) => {
  const response = await axios.post(`${API_URL}/bookings`, bookingData);
  return response.data;
};

// Отримати бронювання користувача
export const getUserBookings = async (userId) => {
  const response = await axios.get(`${API_URL}/bookings`, {
    params: { userId }
  });
  return response.data;
};

// ===== PAYMENT =====

// Обробити платіж
export const processPayment = async ({ bookingId, cardDetails, amount, selectedSeats }) => {
  const response = await axios.post(`${API_URL}/payments`, {
    bookingId, cardDetails, amount, selectedSeats
  });
  return response.data;
};

// Отримати статус платежу
export const getPaymentStatus = async (paymentId) => {
  const response = await axios.get(`${API_URL}/payments/${paymentId}`);
  return response.data;
};

// ===== AUTH =====

// Вхід
export const loginUser = async (userData) => {
  const response = await axios.post(`${API_URL}/auth/login`, userData);
  return response.data;
};

// Реєстрація
export const registerUser = async (userData) => {
  const response = await axios.post(`${API_URL}/auth/register`, userData);
  return response.data;
};

export async function getHalls() {
  const res = await fetch(`${API_URL}/halls`);
  if (!res.ok) throw new Error('Не вдалося завантажити зали');
  return res.json();
}