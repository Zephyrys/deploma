import { useEffect, useState } from 'react';
import { getCinemas, createCinema, updateCinema, deleteCinema } from '../../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CinemaAdmin() {
  const [cinemas, setCinemas] = useState([]);
  const [cinemaForm, setCinemaForm] = useState({ _id: null, name: '', location: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getCinemas()
      .then(data => {
        setCinemas(data);
        setLoading(false);
      })
      .catch(err => {
        toast.error('Помилка при завантаженні кінотеатрів');
        console.error('Помилка при завантаженні кінотеатрів:', err);
        setLoading(false);
      });
  }, []);

  const onCinemaChange = e => {
    const { name, value } = e.target;
    setCinemaForm(f => ({ ...f, [name]: value }));
  };

  const onCinemaSubmit = async e => {
    e.preventDefault();
    try {
      if (cinemaForm._id) {
        await updateCinema(cinemaForm._id, cinemaForm);
        toast.success('Кінотеатр успішно оновлено');
      } else {
        await createCinema(cinemaForm);
        toast.success('Кінотеатр успішно створено');
      }
      const updatedCinemas = await getCinemas();
      setCinemas(updatedCinemas);
      setCinemaForm({ _id: null, name: '', location: '' });
    } catch (error) {
      toast.error('Помилка при збереженні кінотеатру');
      console.error('Помилка при збереженні кінотеатру:', error);
    }
  };

  const onCinemaEdit = cinema => {
    setCinemaForm({ ...cinema });
  };

  const onCinemaDelete = async id => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей кінотеатр?')) return;

    try {
      await deleteCinema(id);
      setCinemas(prev => prev.filter(c => c._id !== id));
      toast.success('Кінотеатр успішно видалено');
    } catch (error) {
      toast.error('Помилка при видаленні кінотеатру');
      console.error('Помилка при видаленні кінотеатру:', error);
    }
  };

  if (loading) return <p>Завантаження...</p>;

  return (
    <section>
      <h2>Управління кінотеатрами</h2>
      <form onSubmit={onCinemaSubmit}>
        <input
          name="name"
          placeholder="Назва"
          value={cinemaForm.name}
          onChange={onCinemaChange}
          required
        />
        <input
          name="location"
          placeholder="Локація"
          value={cinemaForm.location}
          onChange={onCinemaChange}
          required
        />
        <button type="submit">{cinemaForm._id ? 'Оновити' : 'Створити'}</button>
        {cinemaForm._id && (
          <button
            type="button"
            onClick={() => setCinemaForm({ _id: null, name: '', location: '' })}
          >
            Скинути
          </button>
        )}
      </form>

      <h3>Список кінотеатрів</h3>
      <table>
        <thead>
          <tr>
            <th>Назва</th>
            <th>Локація</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {cinemas.length === 0 ? (
            <tr>
              <td colSpan="3" style={{ textAlign: 'center' }}>Кінотеатрів немає</td>
            </tr>
          ) : (
            cinemas.map(cinema => (
              <tr key={cinema._id}>
                <td>{cinema.name}</td>
                <td>{cinema.location}</td>
                <td>
                  <button onClick={() => onCinemaEdit(cinema)}>Редагувати</button>
                  <button onClick={() => onCinemaDelete(cinema._id)} className="delete-button">Видалити</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}
