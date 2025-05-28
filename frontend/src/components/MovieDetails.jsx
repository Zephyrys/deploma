import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMovieById } from '../services/api';

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const data = await getMovieById(id);
        console.log('Дані фільму:', data); 
        setMovie(data);
      } catch (error) {
        console.error('Помилка при отриманні фільму:', error);
      }
    };
    fetchMovie();
  }, [id]);

  if (!movie) return <div>Loading...</div>;

  return (
    <div>
      <h1>{movie.title}</h1>
      <p>{movie.description}</p>
      <p>Genre: {movie.genre}</p>
      <p>Duration: {movie.duration} minutes</p>
      <p>Release Date: {new Date(movie.releaseDate).toLocaleDateString()}</p>
      {movie.posterId?.url && (
        <img
          src={movie.posterId.url}
          alt={movie.title}
          onError={(e) => {
            console.error('Помилка завантаження картинки:', e.target.src); 
          }}
        />
      )}
    </div>
  );
};

export default MovieDetails;