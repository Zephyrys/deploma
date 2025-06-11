import { useEffect, useState } from 'react';
import { getBookings, deleteBooking } from '../../services/api.js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function BookingAdmin() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getBookings()
      .then(data => {
        setBookings(data);
        setLoading(false);
      })
      .catch(err => {
        toast.error('Помилка при завантаженні бронювань');
        console.error('Помилка при завантаженні бронювань:', err);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Ви впевнені, що хочете видалити це бронювання?')) return;

    try {
      await deleteBooking(id);
      setBookings(prev => prev.filter(b => b._id !== id));
      toast.success('Бронювання успішно видалено');
    } catch (err) {
      toast.error('Помилка при видаленні бронювання');
      console.error('Помилка при видаленні бронювання:', err);
    }
  };

  if (loading) return <p>Завантаження...</p>;

  return (
    <section className="booking-admin">
      <h2>Управління бронюваннями</h2>
      <table>
        <thead>
          <tr>
            <th>Ідентифікатор</th>
            <th>Email користувача</th>
            <th>Сесія</th>
            <th>Місця</th>
            <th>Статус бронювання</th>
            <th>Статус оплати</th>
            <th>Сума</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {bookings.length === 0 && (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center' }}>Бронювань немає</td>
            </tr>
          )}
          {bookings.map(booking => (
            <tr key={booking._id}>
              <td>{booking._id}</td>
              <td>{booking.userEmail || '—'}</td>
              <td>{booking.sessionId ? booking.sessionId._id : '—'}</td>
              <td>
                {booking.seats.map(({ row, seat }) => (
                  <span key={`${row}-${seat}`}>[{row},{seat}] </span>
                ))}
              </td>
              <td>{booking.status}</td>
              <td>{booking.paymentStatus}</td>
              <td>{booking.amount} грн</td>
              <td>
                <button onClick={() => handleDelete(booking._id)} className="delete-button">Видалити</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
