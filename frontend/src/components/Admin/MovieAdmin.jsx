import { useEffect, useState } from 'react';
import { toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getMovies,  createMovie, updateMovie, deleteMovie, uploadPoster } from '../../services/api';

export default function MovieAdmin() {
  const [movies, setMovies] = useState([]);
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

  useEffect(() => {
    getMovies().then(setMovies).catch(() => {
      toast.error('Не вдалося завантажити список фільмів');
    });
  }, []);

  const formatDateForInput = dateStr => dateStr ? new Date(dateStr).toISOString().split('T')[0] : '';

  const onMovieChange = e => {
    const { name, value, files } = e.target;
    setMovieForm(f => ({ ...f, [name]: files ? files[0] : value }));
  };

 const onMovieSubmit = async e => {
  e.preventDefault();
  try {
    let updatedMovie;
    const { _id, posterFile, ...cleanData } = movieForm;

    if (posterFile) {
      const uploaded = await uploadPoster(posterFile);
      cleanData.posterId = uploaded._id;
    }

    if (_id) {
      await updateMovie(_id, cleanData);
      updatedMovie = (await getMovies()).find(m => m._id === _id);
      toast.success('Фільм оновлено успішно');
    } else {
      const created = await createMovie(cleanData);
      if (!created || !created._id) {
        throw new Error('Помилка: сервер не повернув створений фільм.');
      }
      updatedMovie = (await getMovies()).find(m => m._id === created._id);
      toast.success('Фільм створено успішно');
    }

    setMovies(prev =>
      prev.some(m => m._id === updatedMovie._id)
        ? prev.map(m => m._id === updatedMovie._id ? updatedMovie : m)
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
    toast.error('Помилка при збереженні фільму');
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
      toast.success('Фільм видалено успішно');
    } catch (error) {
      console.error('Помилка при видаленні фільму:', error);
      toast.error('Сталася помилка при видаленні фільму');
    }
  };

  return (
    <section className="movies-section">
      <h2>Управління фільмами</h2>
      <form className="movie-form" onSubmit={onMovieSubmit}>
        <input name="title" placeholder="Назва" value={movieForm.title} onChange={onMovieChange} required />
        <textarea name="description" placeholder="Опис" value={movieForm.description} onChange={onMovieChange} required />
        <input name="genre" placeholder="Жанр" value={movieForm.genre} onChange={onMovieChange} required />
        <input name="duration" type="number" placeholder="Тривалість" value={movieForm.duration} onChange={onMovieChange} required />
        <input name="releaseDate" type="date" value={movieForm.releaseDate} onChange={onMovieChange} required />
        <input name="posterFile" type="file" accept="image/*" onChange={onMovieChange} />
        <button type="submit">{movieForm._id ? 'Оновити' : 'Створити'}</button>
        {movieForm._id && <button type="button" onClick={() => setMovieForm({
          _id: null,
          title: '',
          description: '',
          genre: '',
          duration: '',
          posterFile: null,
          posterId: null,
          releaseDate: ''
        })}>Скинути</button>}
      </form>
      <h3>Список фільмів</h3>
      <table className="movies-table">
        <thead>
          <tr><th>Назва</th><th>Жанр</th><th>Тривалість</th><th>Дата</th><th>Постер</th><th>Дії</th></tr>
        </thead>
        <tbody>
          {movies.map(movie => (
            <tr key={movie._id}>
              <td>{movie.title}</td>
              <td>{movie.genre}</td>
              <td>{movie.duration}</td>
              <td>{new Date(movie.releaseDate).toLocaleDateString()}</td>
              <td>{movie.posterId ? <img src={movie.posterId.url} width={60} alt="Постер" /> : '—'}</td>
              <td>
                <button onClick={() => onMovieEdit(movie)}>Редагувати</button>
                <button onClick={() => onMovieDelete(movie._id)} className={'delete-button'}>Видалити</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>


    </section>
  );
}
