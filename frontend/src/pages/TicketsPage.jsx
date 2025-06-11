import { useEffect, useState } from 'react';
import { getTickets } from '../services/api'; 
import '../styles/TicketPage.css';

const TicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQr, setSelectedQr] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user?.id;

        if (!token || !userId) {
          setError('Користувач не авторизований');
          setLoading(false);
          return;
        }

        const data = await getTickets(userId, token);
        setTickets(data);
      } catch (err) {
        setError(err.message || 'Не вдалося отримати квитки');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (loading) return <p>Завантаження квитків...</p>;
  if (error) return <p className="text-red-600">Помилка: {error}</p>;
  if (tickets.length === 0) return <p>У вас поки немає квитків.</p>;

  return (
    <div className="tickets-container">
      <h2 className="tickets-title">Мої квитки</h2>
      <div className="tickets-grid">
        {tickets.map(ticket => (
          <div key={ticket._id} className="ticket-card">
            <div className="ticket-header">
              <p><strong>Фільм:</strong> {ticket.movieTitle}</p>
              <p>
                <strong>Зручності залу:</strong> {ticket.movieFormat?.join(', ')}
              </p>
            </div>
            <div className="ticket-details">
              <p><strong>Кінотеатр:</strong> {ticket.cinema}</p>
              <p>
                <strong>Дата сеансу:</strong>{' '}
                {new Date(ticket.sessionStart).toLocaleDateString('uk-UA', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}{' '}
                <strong>Час:</strong>{' '}
                {new Date(ticket.sessionStart).toLocaleTimeString('uk-UA', {
                  hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>
            <div className="ticket-info">
              <p><strong>Ряд:</strong> {ticket.row}</p>
              <p><strong>Місце:</strong> {ticket.seat}</p>
              <p><strong>Ціна:</strong> {ticket.price} грн</p>
              <p className="ticket-status"><strong>Статус:</strong> {ticket.status}</p>
            </div>
            {ticket.qrCode && (
              <div
                className="ticket-footer"
                onClick={() => setSelectedQr(ticket.qrCode)}
              >
                <p className="qr-hint">Натисніть на код, щоб збільшити</p>
                <img src={ticket.qrCode} alt="QR Code" />
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedQr && (
        <div className="qr-backdrop" onClick={() => setSelectedQr(null)}>
          <div className="qr-modal" onClick={e => e.stopPropagation()}>
            <img src={selectedQr} alt="QR Large" />
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsPage;
