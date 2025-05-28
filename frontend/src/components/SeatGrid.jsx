import React from 'react';
import '../styles/SeatGrid.css';

const SeatGrid = ({ seats, onSeatSelect, socketId, sessionId }) => {
  // Фільтруємо масив місць, щоб видалити undefined або null значення
  const filteredSeats = seats.filter((seat) => seat && seat.id);

  return (
    <div className="seat-grid">
      {filteredSeats.map((seat) => {
        let seatClass = 'seat available'; // Вільне місце (зелений)
        if (seat.booked) {
          if (seat.bookedBy === socketId) {
            seatClass = 'seat booked-by-me'; // Заброньоване поточним користувачем (червоний)
          } else {
            seatClass = 'seat booked-by-others'; // Заброньоване іншим користувачем (сірий)
          }
        }

        return (
          <div
            key={`${sessionId}-${seat.id}`} // Унікальний ключ: sessionId + seat.id
            className={seatClass}
            onClick={() => !seat.booked && onSeatSelect(seat.id)}
          >
            {seat.id}
          </div>
        );
      })}
    </div>
  );
};

export default SeatGrid;