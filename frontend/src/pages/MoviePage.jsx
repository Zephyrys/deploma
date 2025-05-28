// src/pages/MoviePage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMovieById } from '../services/api'; // Припустимо, що у вас є така функція
import '../styles/MoviePage.css';

const MoviePage = () => {
  const { id } = useParams(); // Отримуємо id фільму з URL
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const data = await getMovieById(id); // Отримуємо дані фільму за id
        setMovie(data);
      } catch (error) {
        console.error('Помилка при отриманні фільму:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  if (isLoading) {
    return <div>Завантаження...</div>;
  }

  if (!movie) {
    return <div>Фільм не знайдено</div>;
  }

  return (
    <div className="movie-page">
      <h2>{movie.title}</h2>
      {movie.posterId?.url && (
        <img src={movie.posterId.url} alt={movie.title} />
      )}
      <p>{movie.description}</p>
      <p>Рік випуску: {movie.year}</p>
      <p>Жанр: {movie.genre}</p>
    </div>
  );
};

export default MoviePage;