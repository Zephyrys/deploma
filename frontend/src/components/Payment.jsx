
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
// import '../styles/PaymentForm.css';

const PaymentForm = () => {
  const { sessionId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardholderName: ''
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('State from useLocation:', state); // Додати логування
    if (!state || !state.selectedSeats || !state.bookingId) {
      navigate('/error', { state: { error: 'Missing booking information' } });
    }
    
  }, [state, sessionId, navigate]);
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    switch (name) {
      case 'cardNumber':
        formattedValue = value.replace(/\D/g, '').slice(0, 16);
        break;
      case 'expiry':
        formattedValue = value
          .replace(/\D/g, '')
          .replace(/(\d{2})(\d)/, '$1/$2')
          .slice(0, 5);
        break;
      case 'cvv':
        formattedValue = value.replace(/\D/g, '').slice(0, 3);
        break;
    }

    setPaymentData(prev => ({ ...prev, [name]: formattedValue }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setProcessing(true);
  setError('');

  try {
    console.log('State data:', state);

    if (!state.bookingId || !state.selectedSeats || !state.selectedSeats.length) {
      throw new Error('Missing booking ID or selected seats');
    }

    // Перевіряємо формат вибраних місць перед відправкою
    state.selectedSeats.forEach(seat => {
      if (typeof seat.row !== 'number' || typeof seat.seat !== 'number') {
        throw new Error('Invalid seat data');
      }
    });

    const response = await axios.post(
      'http://localhost:5000/api/payments',
      {
        bookingId: state.bookingId, 
        amount: state.total,
        cardDetails: {
          cardNumber: paymentData.cardNumber.replace(/\s/g, ''),
          expiry: paymentData.expiry,
          cvv: paymentData.cvv
        },
        selectedSeats: state.selectedSeats 
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (response.data.success) {
  navigate('/payment-success', {
    state: {
      bookingId: state.bookingId,
      paymentId: response.data.paymentId,
      tickets: response.data.tickets,
      movieTitle: state.movieTitle,
      sessionTime: state.sessionTime,
      selectedSeats: state.selectedSeats,
      total: state.total
    }
  });
}
else {
      setError('Оплата не пройшла');
    }

  } catch (err) {
    setError(err.response?.data?.error || err.message || 'Помилка оплати');
  } finally {
    setProcessing(false);
  }
};


  return (
    <div className="payment-container">
      <h2>Payment Details</h2>
      <div className="payment-summary">
        <p>Movie: {state?.movieTitle}</p>
        <p>Time: {state?.sessionTime}</p>
        <p>Seats: {state?.selectedSeats?.length}</p>
        <h3>Total: ${state?.total}</h3>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Cardholder Name</label>
          <input
            type="text"
            name="cardholderName"
            value={paymentData.cardholderName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Card Number</label>
          <input
            type="text"
            name="cardNumber"
            value={paymentData.cardNumber}
            onChange={handleInputChange}
            placeholder="4242 4242 4242 4242"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Expiry Date (MM/YY)</label>
            <input
              type="text"
              name="expiry"
              value={paymentData.expiry}
              onChange={handleInputChange}
              placeholder="12/25"
              required
            />
          </div>

          <div className="form-group">
            <label>CVV</label>
            <input
              type="text"
              name="cvv"
              value={paymentData.cvv}
              onChange={handleInputChange}
              placeholder="123"
              required
            />
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button 
          type="submit" 
          className="pay-button"
          disabled={processing}
        >
          {processing ? 'Processing...' : 'Confirm Payment'}
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;
