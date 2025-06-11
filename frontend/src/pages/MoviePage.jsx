import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMovieById, sendUserRating } from '../services/api';
import '../styles/MoviePage.css';

const MoviePage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id;
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    console.log(`[MoviePage] Завантаження фільму з id=${id}`);
    const fetchMovie = async () => {
      try {
        const data = await getMovieById(id);
        console.log('[MoviePage] Отримано дані фільму:', data);
        setMovie(data);

        setAverageRating(data.rating || 0);
        setTotalVotes(data.ratingCount || 0);

        const votedMoviesByUser = JSON.parse(localStorage.getItem('votedMoviesByUser') || '{}');
        const userVotes = votedMoviesByUser[userId] || {};
        if (userVotes[id]) {
          setUserRating(userVotes[id]);
          setHasVoted(true);
          console.log(`[MoviePage] Користувач (${userId}) вже голосував за фільм ${id} з рейтингом ${userVotes[id]}`);
        }
      } catch (error) {
        console.error('[MoviePage] Помилка при отриманні фільму:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovie();
  }, [id, userId]);

  const releaseDateFormatted = movie?.releaseDate
    ? new Date(movie.releaseDate).toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'Невідомо';

  const handleStarClick = async (rating) => {
    if (hasVoted) {
      console.log('[MoviePage] Користувач вже голосував, повторне голосування заборонено');
      return;
    }

    console.log(`[MoviePage] Користувач ставить рейтинг ${rating} фільму з id=${id}, userId=${userId}`);

    setUserRating(rating);
    setHasVoted(true);

    const votedMoviesByUser = JSON.parse(localStorage.getItem('votedMoviesByUser') || '{}');
    if (!votedMoviesByUser[userId]) {
      votedMoviesByUser[userId] = {};
    }
    votedMoviesByUser[userId][id] = rating;
    localStorage.setItem('votedMoviesByUser', JSON.stringify(votedMoviesByUser));

    try {
      const response = await sendUserRating(id, rating, userId);
      console.log('[MoviePage] Відповідь від API після надсилання рейтингу:', response);

      if (response.movie?.rating !== undefined && response.movie?.ratingCount !== undefined) {
        setAverageRating(response.movie.rating);
        setTotalVotes(response.movie.ratingCount);
        console.log(`[MoviePage] Оновлено середній рейтинг: ${response.movie.rating}, кількість голосів: ${response.movie.ratingCount}`);
      }
    } catch (error) {
      console.error('[MoviePage] Помилка при надсиланні рейтингу:', error);
    }
  };

  if (isLoading) {
    return <div className="movie-page__loading">Завантаження...</div>;
  }

  if (!movie) {
    return <div className="movie-page__notfound">Фільм не знайдено</div>;
  }

  const displayedRating = hoverRating || userRating || Math.round(averageRating);

  return (
    <div className="movie-page">
      <h2 className="movie-page__title">{movie.title}</h2>

      {movie.posterId?.url && (
        <img className="movie-page__poster" src={movie.posterId.url} alt={movie.title} />
      )}

      <div className="movie-page__info">
        <p className="movie-page__description">{movie.description || 'Опис відсутній.'}</p>

        <ul className="movie-page__details-list">
          <li>
            <strong>Рік випуску:</strong> {releaseDateFormatted}
          </li>
          <li>
            <strong>Жанр:</strong> {movie.genre}
          </li>
          <li>
            <strong>Тривалість:</strong> {movie.duration} хвилин
          </li>
         <li>
            <strong>Рейтинг:</strong>{' '}
            {averageRating
              ? `${Number.isInteger(averageRating) ? averageRating : averageRating.toFixed(1)} / 10`
              : 'Немає даних'}
          </li>
          <li>
            <strong>Оцініть фільм:</strong>
            <div
              className="movie-page__rating-stars"
              aria-label={`Рейтинг фільму: ${averageRating.toFixed(1)} з 10`}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(star => (
                <span
                  key={star}
                  className={`star ${star <= displayedRating ? 'filled' : ''}`}
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  role={hasVoted ? undefined : 'button'}
                  tabIndex={hasVoted ? -1 : 0}
                  aria-pressed={star === userRating}
                  onKeyDown={e => {
                    if (!hasVoted && (e.key === 'Enter' || e.key === ' ')) handleStarClick(star);
                  }}
                >
                  ★
                </span>
              ))}
              <span className="movie-page__user-rating">
                ({totalVotes} голос{totalVotes === 1 ? '' : 'ів'})
              </span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MoviePage;
