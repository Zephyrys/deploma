import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { socket } from '../services/socket';
import { processPayment } from '../services/api';
import CreditCard from '../components/CreditCard';
import '../styles/PaymentPage.css';

const PaymentPage = () => {
  const { sessionId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentData, setPaymentData] = useState({
    cardholderName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const [isCardFlipped, setIsCardFlipped] = useState(false);

  useEffect(() => {
    const verifyState = () => {
      setIsLoading(true);

      if (!state) {
        navigate('/error', { state: { error: 'Сторінка оплати потребує даних про бронювання' } });
        return;
      }

      const requiredFields = [
        'bookingId',
        'selectedSeats',
        'amount',
        'movieTitle',
        'sessionTime'
      ];

      const missingFields = requiredFields.filter(field => !state[field]);
      if (missingFields.length > 0) {
        navigate('/error', {
          state: { error: `Відсутні дані: ${missingFields.join(', ')}` }
        });
        return;
      }

      if (!user) {
        navigate('/login', { state: { from: `/payment/${sessionId}` } });
        return;
      }

      setIsLoading(false);
    };

    verifyState();
  }, [state, user, navigate, sessionId]);

  useEffect(() => {
    if (isLoading) return;

    const handlePaymentSuccess = (updatedSeats) => {
      navigate('/payment-success', {
        state: {
          ...state,
          seats: updatedSeats
        }
      });
    };

    const handlePaymentError = (errorMsg) => {
      setError(errorMsg);
      setProcessing(false);
    };

    socket.connect();
    socket.on('payment-success', handlePaymentSuccess);
    socket.on('payment-error', handlePaymentError);

    return () => {
      socket.off('payment-success', handlePaymentSuccess);
      socket.off('payment-error', handlePaymentError);
    };
  }, [isLoading, state, navigate]);

const handleSubmit = async (e) => {
  e.preventDefault();
  setProcessing(true);
  setError('');

  try {
    const cardNumber = paymentData.cardNumber.replace(/\s/g, '');
    const cvv = paymentData.cvv.trim();

    if (!/^\d{16}$/.test(cardNumber)) {
      throw new Error('Номер картки має складатися з 16 цифр');
    }

    if (!/^\d{3}$/.test(cvv)) {
      throw new Error('CVV має складатися з 3 цифр');
    }

    const paymentResult = await processPayment({
      bookingId: state.bookingId,
      cardDetails: {
        number: cardNumber,
        expiry: paymentData.expiry.replace(/\D/g, ''),
        cvv: cvv
      },
      amount: state.amount,
      selectedSeats: state.selectedSeats
    });

    if (paymentResult.success) {
      socket.emit('confirm-payment', {
        sessionId,
        seats: state.selectedSeats,
        paymentId: paymentResult.paymentId
      });
    }
  } catch (err) {
    const errorMessage = err.message || 'Сталася невідома помилка';
    setError(errorMessage);
    setProcessing(false);
  }
};


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    switch(name) {
      case 'cardNumber':
        formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19);
        break;
      case 'expiry':
        formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
        break;
      case 'cvv':
        formattedValue = value.slice(0, 3);
        break;
      default:
        break;
    }

    setPaymentData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handleFocus = (e) => {
    if (e.target.name === 'cvv') {
      setIsCardFlipped(true);
    }
  };

  const handleBlur = (e) => {
    if (e.target.name === 'cvv') {
      setIsCardFlipped(false);
    }
  };

  if (isLoading) {
    return <div className="loading-screen">Завантаження даних оплати...</div>;
  }

  return (
    <div className="payment-container">
      <div className="payment-header">
        <h1>Оплата квитків</h1>
        <div className="movie-info">
          <h2>{state.movieTitle}</h2>
          <p className="session-time">
            {new Date(state.sessionTime).toLocaleDateString('uk-UA', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      <div className="payment-content">
        <div className="order-summary">
          <h3>Деталі замовлення</h3>
          <div className="order-details">
            <div className="detail-item">
              <span>Кількість місць:</span>
              <span>{state.selectedSeats.length}</span>
            </div>
            <div className="detail-item total">
              <span>До сплати:</span>
              <span>{state.amount} ₴</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="payment-form" noValidate>
          <CreditCard
            cardholderName={paymentData.cardholderName}
            cardNumber={paymentData.cardNumber}
            expiry={paymentData.expiry}
            cvv={paymentData.cvv}
            isFlipped={isCardFlipped}
          />

          <div className="form-section">
            <h3>Дані картки</h3>
            
            <div className="form-group">
              <label>Ім'я власника картки</label>
              <input
                type="text"
                name="cardholderName"
                value={paymentData.cardholderName}
                onChange={handleInputChange}
                placeholder="John Doe"
                required
                pattern="[A-Za-z ]+"
              />
            </div>

            <div className="form-group">
              <label>Номер картки</label>
              <input
                type="text"
                name="cardNumber"
                value={paymentData.cardNumber}
                onChange={handleInputChange}
                pattern="\d{16}"
                placeholder="0000 0000 0000 0000"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Термін дії</label>
                <input
                  type="text"
                  name="expiry"
                  value={paymentData.expiry}
                  onChange={handleInputChange}
                  placeholder="ММ/РР"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>CVV/CVC</label>
                <input
                  type="text"
                  name="cvv"
                  value={paymentData.cvv}
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  pattern="\d{3}"
                  placeholder="123"
                  required
                />
              </div>
            </div>
          </div>

          {error && <div className="error-message"><i className="error-icon">!</i>{error}</div>}

          <button 
            type="submit" 
            className="pay-button"
            disabled={processing}
          >
            {processing ? (
              <>
                <span className="spinner"></span>
                Обробка...
              </>
            ) : (
              'Підтвердити оплату'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;
