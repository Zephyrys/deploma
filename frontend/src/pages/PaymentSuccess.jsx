import { useLocation, useNavigate } from 'react-router-dom';
import "../styles/PaymentSuccess.css";

const PaymentSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return (
      <div className="payment-success-wrapper">
        <div className="payment-success-box">
          <h2>Помилка</h2>
          <p>Дані не передані. <button onClick={() => navigate('/')}>На головну</button></p>
        </div>
      </div>
    );
  }

  const { movieTitle, sessionTime, selectedSeats, amount } = state;

  return (
   <div className="payment-success-container">
  <div className="payment-success-content">
    <div className="payment-success-header">Оплата пройшла успішно</div>
    <div className="session-info">
      <span><strong>Фільм:</strong> {movieTitle}</span>
      <span><strong>Дата та час:</strong> {new Date(sessionTime).toLocaleString()}</span>
    </div>
    <div className="seats-grid">
      <div className="seat-row">
        <div className="row-label">Обрані місця:</div>
        <div className="seats-in-row">
          {selectedSeats.map((seat, index) => (
            <div key={index} className="seat selected">
              {seat.row + 1}-{seat.seat + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="payment-footer">
      <div className="total-amount">Загальна сума: {amount} грн.</div>
      <button className="return-home-button" onClick={() => navigate('/')}>На головну</button>
    </div>
  </div>
</div>

  );
};

export default PaymentSuccess;
