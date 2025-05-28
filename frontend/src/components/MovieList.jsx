import React, { useEffect, useState } from 'react';
import { getMovies } from '../services/api';
import { Link } from 'react-router-dom';
import '../styles/MovieList.css';

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await getMovies();
        setMovies(data);
        console.log("MOVIES ", data)
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="movie-list">
      {movies.map(movie => (
        <Link to={`/movies/${movie._id}`} key={movie._id} className="movie-card">
          <h3>{movie.title}</h3>
          <img src={movie?.posterId?.url} alt={movie.title} />
        </Link>
      ))}
    </div>
  );
};

export default MovieList;