
import '../styles/CreditCard.css';

const CreditCard = ({ cardholderName, cardNumber, expiry, cvv, isFlipped }) => {
  const formatCardNumber = (number) => {
    if (!number) return '#### #### #### ####';
    return number.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (expiry) => {
    if (!expiry) return 'MM/YY';
    return expiry.length === 4 && !expiry.includes('/') ? expiry.slice(0,2) + '/' + expiry.slice(2) : expiry;
  };

  return (
    <div className={`credit-card ${isFlipped ? 'flipped' : ''}`}>
      <div className="card-front">
        <div className="card-chip" />
        <div className="card-number">{formatCardNumber(cardNumber)}</div>
        <div className="card-name">{cardholderName || 'CARDHOLDER NAME'}</div>
        <div className="card-expiry">
          <span>VALID THRU</span>
          <span>{formatExpiry(expiry)}</span>
        </div>
      </div>

      <div className="card-back">
        <div className="magnetic-strip" />
        <div className="signature-box">
          <div className="cvv">{cvv || '###'}</div>
        </div>
        <div className="card-info-back">
          <p>Bank Name</p>
          <p>Customer Service: 1234 5678 9012</p>
        </div>
      </div>
    </div>
  );
};

export default CreditCard;
