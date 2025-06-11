import { useEffect, useState } from 'react';
import { getMovies } from '../services/api';
import { Link } from 'react-router-dom';
import '../styles/MovieList.css';

const MOVIES_PER_PAGE = 20;

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTitle, setFilterTitle] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await getMovies();
        setMovies(data);
        setFilteredMovies(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const genres = Array.from(new Set(movies.map(m => m.genre))).filter(Boolean);
  const years = Array.from(
    new Set(movies.map(m => m.releaseDate && new Date(m.releaseDate).getFullYear()))
  )
    .filter(Boolean)
    .sort((a, b) => b - a);

  useEffect(() => {
    let filtered = movies;

    if (filterTitle.trim()) {
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(filterTitle.toLowerCase())
      );
    }

    if (filterGenre) {
      filtered = filtered.filter(movie => movie.genre === filterGenre);
    }

    if (filterYear) {
      filtered = filtered.filter(movie => {
        const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '';
        return String(year) === filterYear;
      });
    }

    setFilteredMovies(filtered);
    setCurrentPage(1);
  }, [filterTitle, filterGenre, filterYear, movies]);

  const totalPages = Math.ceil(filteredMovies.length / MOVIES_PER_PAGE);

  const moviesToShow = filteredMovies.slice(
    (currentPage - 1) * MOVIES_PER_PAGE,
    currentPage * MOVIES_PER_PAGE
  );

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  if (loading) return <div>Завантаження...</div>;

  return (
    <div className="movie-list-wrapper">
      <div className="filter-bar" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Пошук фільмів..."
          value={filterTitle}
          onChange={(e) => setFilterTitle(e.target.value)}
          className="filter-input"
        />

        <select
          value={filterGenre}
          onChange={(e) => setFilterGenre(e.target.value)}
          className="filter-select"
        >
          <option value="">Всі жанри</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </select>

        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="filter-select"
        >
          <option value="">Всі роки</option>
          {years.map((year) => (
            <option key={year} value={String(year)}>{year}</option>
          ))}
        </select>
      </div>

      <div className="movie-list">
        {moviesToShow.length > 0 ? (
          moviesToShow.map(movie => {
            console.log('posterId:', movie.posterId);
            return (
              <Link to={`/movies/${movie._id}`} key={movie._id} className="movie-card">
                <h3>{movie.title}</h3>
                <img src={movie?.posterId?.url} alt={movie.title} />
              </Link>
            );
          })
        ) : (
          <p>Фільми не знайдені.</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={handlePrevPage} disabled={currentPage === 1}>
            Попередня
          </button>
          <span>{currentPage} / {totalPages}</span>
          <button onClick={handleNextPage} disabled={currentPage === totalPages}>
            Наступна
          </button>
        </div>
      )}
    </div>
  );
};

export default MovieList;
