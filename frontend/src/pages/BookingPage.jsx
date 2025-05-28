import React, { useState } from 'react';
import SessionSelection from '../components/SessionSelection';
import SeatSelection from '../components/SeatSelection';
import Payment from '../components/payment';
import '../styles/BookingPage.css';

const BookingPage = () => {
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);

  const handlePaymentSuccess = () => {
    alert('Оплата успішна! Ваші місця заброньовані.');
    setSelectedSession(null);
    setSelectedSeats([]);
  };

  return (
    <div className="booking-page">
      <h1>Бронювання місць</h1>
      {!selectedSession ? (
        <SessionSelection onSelectSession={setSelectedSession} />
      ) : (
        <>
          <SeatSelection session={selectedSession} onSelectSeats={setSelectedSeats} />
          {selectedSeats.length > 0 && (
            <Payment
              session={selectedSession}
              selectedSeats={selectedSeats}
              onPaymentSuccess={handlePaymentSuccess}
            />
          )}
        </>
      )}
    </div>
  );
};

export default BookingPage;