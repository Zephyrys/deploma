import React, { useEffect, useState } from 'react';
import {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  uploadPoster,
  getSessions,
  createSession,
  updateSession,
  deleteSession,
  getHalls
} from '../services/api';
import '../styles/AdminPanel.css';

export default function AdminPage() {
  const [tab, setTab] = useState('movies');

  const [movies, setMovies] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [halls, setHalls] = useState([]);

  const [movieForm, setMovieForm] = useState({
    _id: null,
    title: '',
    description: '',
    genre: '',
    duration: '',
    posterFile: null,
    posterId: null,
    releaseDate: ''
  });

  const [sessionForm, setSessionForm] = useState({
    _id: null,
    movieId: '',
    hallId: '',
    startTime: '',
    endTime: '',
    seatPrice: ''
  });

  // Завантаження початкових даних
  useEffect(() => {
    async function load() {
      try {
        const [moviesData, sessionsData, hallsData] = await Promise.all([
          getMovies(),
          getSessions(),
          getHalls()
        ]);
        setMovies(moviesData);
        setSessions(sessionsData);
        setHalls(hallsData);
      } catch (error) {
        console.error('Помилка при завантаженні початкових даних:', error);
      }
    }
    load();
  }, []);

  // --- Функції для фільмів ---

  const onMovieChange = e => {
    const { name, value, files } = e.target;
    const newValue = files ? files[0] : value;
    setMovieForm(f => ({
      ...f,
      [name]: newValue
    }));
  };

  const formatDateForInput = dateStr => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

const onMovieSubmit = async e => {
  e.preventDefault();

  try {
    let dataToSend = { ...movieForm };

    if (dataToSend.posterFile) {
      const uploaded = await uploadPoster(dataToSend.posterFile);
      dataToSend.posterId = uploaded._id;
    }

    delete dataToSend.posterFile;

    let updatedMovie;
    if (dataToSend._id) {
      await updateMovie(dataToSend._id, dataToSend);
      updatedMovie = await getMovieById(dataToSend._id);
    } else {
      const created = await createMovie(dataToSend);
      updatedMovie = await getMovieById(created._id);
    }

    // Додаємо або оновлюємо в списку фільмів
    setMovies(prev =>
      prev.some(m => m._id === updatedMovie._id)
        ? prev.map(m => (m._id === updatedMovie._id ? updatedMovie : m))
        : [...prev, updatedMovie]
    );

    setMovieForm({
      _id: null,
      title: '',
      description: '',
      genre: '',
      duration: '',
      posterFile: null,
      posterId: null,
      releaseDate: ''
    });
  } catch (error) {
    console.error('Помилка при збереженні фільму:', error);
  }
};



  const onMovieEdit = movie => {
    setMovieForm({
      ...movie,
      posterFile: null,
      releaseDate: formatDateForInput(movie.releaseDate)
    });
  };

  const onMovieDelete = async id => {
    try {
      await deleteMovie(id);
      setMovies(movies => movies.filter(m => m._id !== id));
    } catch (error) {
      console.error('Помилка при видаленні фільму:', error);
    }
  };

  // --- Функції для сеансів ---

  const onSessionChange = e => {
    const { name, value } = e.target;
    setSessionForm(f => ({ ...f, [name]: value }));
  };

const onSessionSubmit = async e => {
  e.preventDefault();

  try {
    let updatedSession;
    if (sessionForm._id) {
      await updateSession(sessionForm._id, sessionForm);
      updatedSession = (await getSessions()).find(s => s._id === sessionForm._id);
    } else {
      const created = await createSession(sessionForm);
      updatedSession = (await getSessions()).find(s => s._id === created._id);
    }

    // Оновлюємо або додаємо сеанс у список
    setSessions(prev =>
      prev.some(s => s._id === updatedSession._id)
        ? prev.map(s => (s._id === updatedSession._id ? updatedSession : s))
        : [...prev, updatedSession]
    );

    setSessionForm({
      _id: null,
      movieId: '',
      hallId: '',
      startTime: '',
      endTime: '',
      seatPrice: ''
    });
  } catch (error) {
    console.error('Помилка при збереженні сеансу:', error);
  }
};



  const onSessionEdit = session => {
    setSessionForm({
      ...session,
      startTime: session.startTime.slice(0, 16),
      endTime: session.endTime.slice(0, 16)
    });
  };

  const onSessionDelete = async id => {
    try {
      await deleteSession(id);
      setSessions(s => s.filter(sess => sess._id !== id));
    } catch (error) {
      console.error('Помилка при видаленні сеансу:', error);
    }
  };

  return (
    <div className="admin-page">
      <h1>Адмін-панель</h1>
      <nav>
        <button
          className={tab === 'movies' ? 'active' : ''}
          onClick={() => setTab('movies')}
        >
          Фільми
        </button>
        <button
          className={tab === 'sessions' ? 'active' : ''}
          onClick={() => setTab('sessions')}
        >
          Сеанси
        </button>
      </nav>

      {tab === 'movies' && (
        <section className="movies-section">
          <h2>Управління фільмами</h2>
          <form className="movie-form" onSubmit={onMovieSubmit}>
            <input
              type="text"
              name="title"
              placeholder="Назва"
              value={movieForm.title}
              onChange={onMovieChange}
              required
            />
            <textarea
              name="description"
              placeholder="Опис"
              value={movieForm.description}
              onChange={onMovieChange}
              required
            />
            <input
              type="text"
              name="genre"
              placeholder="Жанр"
              value={movieForm.genre}
              onChange={onMovieChange}
              required
            />
            <input
              type="number"
              name="duration"
              placeholder="Тривалість (хв)"
              value={movieForm.duration}
              onChange={onMovieChange}
              required
            />
            <input
              type="date"
              name="releaseDate"
              placeholder="Дата виходу"
              value={movieForm.releaseDate}
              onChange={onMovieChange}
              required
            />
            <input
              type="file"
              name="posterFile"
              accept="image/*"
              onChange={onMovieChange}
            />
            <button type="submit">
              {movieForm._id ? 'Оновити' : 'Створити'}
            </button>
            {movieForm._id && (
              <button
                type="button"
                onClick={() =>
                  setMovieForm({
                    _id: null,
                    title: '',
                    description: '',
                    genre: '',
                    duration: '',
                    posterFile: null,
                    posterId: null,
                    releaseDate: ''
                  })
                }
              >
                Скинути
              </button>
            )}
          </form>

          <h3>Список фільмів</h3>
          <table className="movies-table">
            <thead>
              <tr>
                <th>Назва</th>
                <th>Жанр</th>
                <th>Тривалість</th>
                <th>Дата виходу</th>
                <th>Постер</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {movies.map(movie => (
                <tr key={movie._id}>
                  <td>{movie.title}</td>
                  <td>{movie.genre}</td>
                  <td>{movie.duration} хв</td>
                  <td>{new Date(movie.releaseDate).toLocaleDateString()}</td>
                  <td>
                    {movie.posterId ? (
                      <img
                        src={movie.posterId.url}
                        alt="Постер"
                        width={60}
                      />
                    ) : (
                      'Немає'
                    )}
                  </td>
                  <td>
                    <button onClick={() => onMovieEdit(movie)}>Редагувати</button>
                    <button onClick={() => onMovieDelete(movie._id)}>Видалити</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {tab === 'sessions' && (
        <section className="sessions-section">
          <h2>Управління сеансами</h2>
          <form className="session-form" onSubmit={onSessionSubmit}>
            <select
              name="movieId"
              value={sessionForm.movieId}
              onChange={onSessionChange}
              required
            >
              <option value="">Виберіть фільм</option>
              {movies.map(movie => (
                <option key={movie._id} value={movie._id}>
                  {movie.title}
                </option>
              ))}
            </select>
            <select
              name="hallId"
              value={sessionForm.hallId}
              onChange={onSessionChange}
              required
            >
              <option value="">Виберіть зал</option>
              {halls.map(hall => (
                <option key={hall._id} value={hall._id}>
                  {hall.name}
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              name="startTime"
              value={sessionForm.startTime}
              onChange={onSessionChange}
              required
            />
            <input
              type="datetime-local"
              name="endTime"
              value={sessionForm.endTime}
              onChange={onSessionChange}
              required
            />
            <input
              type="number"
              name="seatPrice"
              placeholder="Ціна за місце"
              value={sessionForm.seatPrice}
              onChange={onSessionChange}
              required
              min="0"
            />
            <button type="submit">
              {sessionForm._id ? 'Оновити' : 'Створити'}
            </button>
            {sessionForm._id && (
              <button
                type="button"
                onClick={() =>
                  setSessionForm({
                    _id: null,
                    movieId: '',
                    hallId: '',
                    startTime: '',
                    endTime: '',
                    seatPrice: ''
                  })
                }
              >
                Скинути
              </button>
            )}
          </form>

          <h3>Список сеансів</h3>
          <table className="sessions-table">
            <thead>
              <tr>
                <th>Фільм</th>
                <th>Зал</th>
                <th>Початок</th>
                <th>Кінець</th>
                <th>Ціна</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(session => {
                const movie = movies.find(m => m._id === session.movieId._id);
                const hall = halls.find(h => h._id === session.hallId._id);
                return (
                  <tr key={session._id}>
                    <td>{movie?.title || 'Н/Д'}</td>
                    <td>{hall?.name || 'Н/Д'}</td>
                    <td>{new Date(session.startTime).toLocaleString()}</td>
                    <td>{new Date(session.endTime).toLocaleString()}</td>
                    <td>{session.seatPrice} грн</td>
                    <td>
                      <button onClick={() => onSessionEdit(session)}>Редагувати</button>
                      <button onClick={() => onSessionDelete(session._id)}>Видалити</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
