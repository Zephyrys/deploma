import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getSessions, createSession, updateSession, deleteSession, getMovies, getHalls } from '../../services/api';

export default function SessionAdmin() {
  const [sessions, setSessions] = useState([]);
  const [movies, setMovies] = useState([]);
  const [halls, setHalls] = useState([]);

  const [sessionForm, setSessionForm] = useState({
    _id: null,
    movieId: '',
    hallId: '',
    startTime: '',
    endTime: '',
    seatPrice: ''
  });

  const getStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (now < start) return 'scheduled';
    if (now >= start && now <= end) return 'active';
    return 'completed';
  };

  useEffect(() => {
    Promise.all([getSessions(), getMovies(), getHalls()])
      .then(([s, m, h]) => {
        const sessionsWithStatus = s.map(sess => ({
          ...sess,
          status: getStatus(sess.startTime, sess.endTime)
        }));
        setSessions(sessionsWithStatus);
        setMovies(m);
        setHalls(h);
      })
      .catch(error => {
        toast.error('Помилка при завантаженні даних');
        console.error(error);
      });
  }, []);

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
        toast.success('Сеанс оновлено успішно');
      } else {
        const { _id, ...cleanData } = sessionForm;
        const created = await createSession(cleanData);
        if (!created || !created._id) {
          throw new Error('Помилка: сервер не повернув створений сеанс.');
        }
        updatedSession = (await getSessions()).find(s => s._id === created._id);
        toast.success('Сеанс створено успішно');
      }

      updatedSession.status = getStatus(updatedSession.startTime, updatedSession.endTime);

      setSessions(prev =>
        prev.some(s => s._id === updatedSession._id)
          ? prev.map(s => s._id === updatedSession._id ? updatedSession : s)
          : [...prev, updatedSession]
      );

      setSessionForm({ _id: null, movieId: '', hallId: '', startTime: '', endTime: '', seatPrice: '' });
    } catch (error) {
      toast.error('Помилка при збереженні сеансу');
      console.error('Помилка при збереженні сеансу:', error);
    }
  };

  const onSessionEdit = session => {
    setSessionForm({
      _id: session._id,
      movieId: typeof session.movieId === 'string' ? session.movieId : session.movieId?._id || '',
      hallId: typeof session.hallId === 'string' ? session.hallId : session.hallId?._id || '',
      startTime: session.startTime.slice(0, 16),
      endTime: session.endTime.slice(0, 16),
      seatPrice: session.seatPrice || ''
    });
  };

  const onSessionDelete = async id => {
    try {
      await deleteSession(id);
      setSessions(s => s.filter(sess => sess._id !== id));
      toast.success('Сеанс видалено успішно');
    } catch (error) {
      toast.error('Помилка при видаленні сеансу');
      console.error('Помилка при видаленні сеансу:', error);
    }
  };

  return (
    <section className="sessions-section">
     
      <h2>Управління сеансами</h2>
      <form className="session-form" onSubmit={onSessionSubmit}>
        <select name="movieId" value={sessionForm.movieId} onChange={onSessionChange} required>
          <option value="">Виберіть фільм</option>
          {movies.map(movie => <option key={movie._id} value={movie._id}>{movie.title}</option>)}
        </select>
        <select name="hallId" value={sessionForm.hallId} onChange={onSessionChange} required>
          <option value="">Виберіть зал</option>
          {halls.map(hall => <option key={hall._id} value={hall._id}>{hall.name}</option>)}
        </select>
        <input type="datetime-local" name="startTime" value={sessionForm.startTime} onChange={onSessionChange} required />
        <input type="datetime-local" name="endTime" value={sessionForm.endTime} onChange={onSessionChange} required />
        <input type="number" name="seatPrice" placeholder="Ціна за місце" value={sessionForm.seatPrice} onChange={onSessionChange} required />
        <button type="submit">{sessionForm._id ? 'Оновити' : 'Створити'}</button>
        {sessionForm._id && (
          <button type="button" onClick={() => setSessionForm({ _id: null, movieId: '', hallId: '', startTime: '', endTime: '', seatPrice: '' })}>
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
            <th>Статус</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(session => (
            <tr key={session._id}>
              <td>{session.movieId?.title || '—'}</td>
              <td>{session.hallId?.name || '—'}</td>
              <td>{new Date(session.startTime).toLocaleString()}</td>
              <td>{new Date(session.endTime).toLocaleString()}</td>
              <td>{session.seatPrice} грн</td>
              <td>{session.status}</td>
              <td>
                <button onClick={() => onSessionEdit(session)}>Редагувати</button>
                <button onClick={() => onSessionDelete(session._id)} className="delete-button">Видалити</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
