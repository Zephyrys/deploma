import { useState, useEffect } from 'react';
import { getSessions } from '../services/api';
import '../styles/SessionPage.css';
import { Link } from 'react-router-dom';

const SessionPage = () => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCinema, setSelectedCinema] = useState('Усі');
  const [selectedMovie, setSelectedMovie] = useState('Усі');

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getSessions();
        console.log('Отримані сеанси:', data);
        setSessions(data);
      } catch (error) {
        console.error('Помилка при завантаженні сеансів:', error);
        setError('Не вдалося завантажити сеанси. Спробуйте ще раз.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const uniqueCinemas = [
    'Усі',
    ...Array.from(
      new Set(
        sessions
          .map((s) => s.hallId?.cinemaId)
          .filter(Boolean)
          .map((cinema) => cinema.name)
      )
    ),
  ];

  const uniqueMovies = [
    'Усі',
    ...Array.from(
      new Set(
        sessions
          .map((s) => s.movieId?.title)
          .filter(Boolean)
      )
    ),
  ];

  const filteredSessions = sessions.filter((s) => {
    const cinemaMatch =
      selectedCinema === 'Усі' || s.hallId?.cinemaId?.name === selectedCinema;
    const movieMatch =
      selectedMovie === 'Усі' || s.movieId?.title === selectedMovie;
    return cinemaMatch && movieMatch;
  });

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (isLoading) {
    return <div className="loading">Завантаження сеансів...</div>;
  }

  return (
    <div className="session-selection">
      <h2>Виберіть сеанс</h2>

      <div className="filters-container">
        <div className="filter-section">
          <label htmlFor="cinema-filter">Фільтрувати за кінотеатром:</label>
          <select
            id="cinema-filter"
            value={selectedCinema}
            onChange={(e) => setSelectedCinema(e.target.value)}
          >
            {uniqueCinemas.map((cinemaName) => (
              <option key={cinemaName} value={cinemaName}>
                {cinemaName}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-section">
          <label htmlFor="movie-filter">Фільтрувати за фільмом:</label>
          <select
            id="movie-filter"
            value={selectedMovie}
            onChange={(e) => setSelectedMovie(e.target.value)}
          >
            {uniqueMovies.map((movieTitle) => (
              <option key={movieTitle} value={movieTitle}>
                {movieTitle}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ul className="session-list">
        {filteredSessions.map((session) => {
          const startTime = new Date(session.startTime).toLocaleString();
          const endTime = new Date(session.endTime).toLocaleString();
          const availableSeats = session.seats
            .flat()
            .filter((seat) => !seat.isOccupied).length;

          const cinema = session.hallId?.cinemaId;
          const hall = session.hallId;
          const isCompleted = session.status === 'completed';

          return (
            <li key={session._id} className="session-card">
              <div className="movie-info">
                <h3>{session.movieId.title}</h3>
                <p className="genre">{session.movieId.genre}</p>
                <p className="duration">Тривалість: {session.movieId.duration} хв</p>
              </div>

              <div className="cinema-info">
                <h4>{cinema?.name}</h4>
                <p>Адреса: {cinema?.location}</p>
                <p>Зал: {hall?.name}</p>
                <p>Технології: {hall?.amenities?.join(', ')}</p>
                <p>Години роботи: {cinema?.openingHours}</p>
              </div>

              <div className="session-time">
                <p>Початок: {startTime}</p>
                <p>Закінчення: {endTime}</p>
                <p className="seats-available">Вільних місць: {availableSeats}</p>
              </div>

              {isCompleted ? (
                <button className="select-button disabled" disabled>
                  Сеанс завершено
                </button>
              ) : (
                <Link
                  to={{ pathname: `/seats/${session._id}` }}
                  state={session.seats}
                  className="select-button"
                >
                  Вибрати місця
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SessionPage;
