import { useParams, useLocation } from 'react-router-dom';

const Ticket = () => {
  const { sessionId } = useParams();
  const location = useLocation();
  const { selectedSeats } = location.state;

  return (
    <div className="ticket">
      <h2>Ваш квиток</h2>
      <p>Сеанс: {sessionId}</p>
      <p>Місця: {selectedSeats.join(', ')}</p>
      <p>Дякуємо за покупку!</p>
    </div>
  );
};

export default Ticket;