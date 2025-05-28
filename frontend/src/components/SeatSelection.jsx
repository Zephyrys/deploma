import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSessionById, createBooking } from '../services/api';
import { socket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/SeatSelection.css';

const SeatSelection = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [rows, setRows] = useState([]); // масив рядів з місцями
  const [lockedSeats, setLockedSeats] = useState(new Set()); // заблоковані місця
  const [selectedSeats, setSelectedSeats] = useState(new Set()); // вибрані користувачем
  const [isLoading, setIsLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null); // дані сесії, наприклад ціна і час

  // Завантаження сесії при монтуванні
  useEffect(() => {
    const loadSession = async () => {
      try {
        setIsLoading(true);
        const session = await getSessionById(sessionId);
        if (!session?.seats) throw new Error('Невірний формат місць');

        setSessionData(session);
        setRows(session.seats);
        socket.emit('join-session', sessionId);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();

    // Відписка від сесії при розмонтуванні
    return () => {
      socket.emit('leave-session', sessionId);
    };
  }, [sessionId]);

  // Ініціалізація місць та блокувань від сокета
  useEffect(() => {
    const handleSeatsInit = ({ seats, locks }) => {
      setRows(seats);
      setLockedSeats(new Set(Object.keys(locks)));
      setSelectedSeats(new Set());
    };

    socket.on('seats-init', handleSeatsInit);
    return () => socket.off('seats-init', handleSeatsInit);
  }, []);

  // Оновлення місць (наприклад, при бронюванні кимось іншим)
  useEffect(() => {
    const handleSeatsUpdate = (updatedSeats) => {
      setRows(updatedSeats);
      setSelectedSeats(new Set());
    };

    socket.on('seats-updated', handleSeatsUpdate);
    return () => socket.off('seats-updated', handleSeatsUpdate);
  }, []);

  // Оновлення блокувань місць
  useEffect(() => {
    const handleLocksUpdate = (locks) => {
      setLockedSeats(new Set(Object.keys(locks)));
    };

    socket.on('locks-updated', handleLocksUpdate);
    return () => socket.off('locks-updated', handleLocksUpdate);
  }, []);

  // Локальне блокування/розблокування місця (для поточного користувача)
  useEffect(() => {
    const handleSeatLocked = ({ row, seat }) => {
      setLockedSeats(prev => new Set([...prev, `${row}-${seat}`]));
    };

    const handleSeatUnlocked = ({ row, seat }) => {
      setLockedSeats(prev => {
        const updated = new Set(prev);
        updated.delete(`${row}-${seat}`);
        return updated;
      });
    };

    socket.on('seat-locked', handleSeatLocked);
    socket.on('seat-unlocked', handleSeatUnlocked);

    return () => {
      socket.off('seat-locked', handleSeatLocked);
      socket.off('seat-unlocked', handleSeatUnlocked);
    };
  }, []);

  // Обробка помилок від сервера
  useEffect(() => {
    const handleSeatError = (message) => {
      toast.error(message);
    };

    socket.on('seat-error', handleSeatError);
    return () => socket.off('seat-error', handleSeatError);
  }, []);

  // Обробник кліку по місцю
  const handleSeatClick = (rowIndex, seatIndex) => {
    const seatKey = `${rowIndex}-${seatIndex}`;
    const seat = rows[rowIndex]?.[seatIndex];

    if (!seat || seat.isOccupied) {
      toast.warning('Місце вже зайняте');
      return;
    }

    if (lockedSeats.has(seatKey) && !selectedSeats.has(seatKey)) {
      toast.warning('Місце заблоковане іншим користувачем');
      return;
    }

    if (selectedSeats.size >= 5 && !selectedSeats.has(seatKey)) {
      toast.info('Максимум 5 місць');
      return;
    }

    // Відправляємо на сервер toggle-сигнал для блокування/розблокування місця
    socket.emit('toggle-seat', {
      sessionId,
      row: rowIndex,
      seat: seatIndex
    });

    // Локальне оновлення вибраних місць
    setSelectedSeats(prev => {
      const updated = new Set(prev);
      if (updated.has(seatKey)) {
        updated.delete(seatKey);
      } else {
        updated.add(seatKey);
      }
      return updated;
    });
  };

  // Функція бронювання вибраних місць
  const handleBooking = async () => {
    if (!user || !sessionData) return;

    const seatsArray = [...selectedSeats].map(seat => {
      const [row, seatIndex] = seat.split('-').map(Number);
      return { row, seat: seatIndex };
    });

    try {
      const response = await createBooking({
        sessionId,
        seats: seatsArray,
        userId: user.id
      });
      const booking = response.data;

      navigate(`/payment/${sessionId}`, {
        state: {
          bookingId: booking._id,
          seats: seatsArray,
          selectedSeats: seatsArray,
          amount: seatsArray.length * sessionData.seatPrice,
          movieTitle: sessionData.movieId.title,
          sessionTime: sessionData.startTime,
          seatPrice: sessionData.seatPrice
        }
      });
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Отримуємо стан місця: зайняте, заблоковане, вибране
  const getSeatState = (rowIndex, seatIndex) => {
    const seat = rows[rowIndex]?.[seatIndex];
    const seatKey = `${rowIndex}-${seatIndex}`;

    return {
      isOccupied: seat?.isOccupied || false,
      isLocked: lockedSeats.has(seatKey),
      isSelected: selectedSeats.has(seatKey)
    };
  };

  if (isLoading) return <div className="loading">Завантаження...</div>;

  return (
    <div className="seat-selection-container">
      <ToastContainer />
      <header className="session-header">
        <h1>{sessionData?.movieId?.title}</h1>
        <div className="session-info">
          <span>{new Date(sessionData?.startTime).toLocaleString()}</span>
          <span>Ціна: {sessionData?.seatPrice} грн</span>
        </div>
      </header>

      <div className="screen">Екран</div>

      <div className="seats-grid">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="seat-row">
            <div className="row-number">{rowIndex + 1}</div>
            <div className="seats-in-row">
              {row.map((_, seatIndex) => {
                const { isOccupied, isLocked, isSelected } = getSeatState(rowIndex, seatIndex);
                return (
                  <button
                    key={seatIndex}
                    className={`seat ${isOccupied ? 'occupied' : ''} ${isLocked ? 'locked' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSeatClick(rowIndex, seatIndex)}
                    disabled={isOccupied || (isLocked && !isSelected)}
                    title={`Місце ${seatIndex + 1}`}
                  >
                    {seatIndex + 1}
                    {isSelected && <span className="checkmark">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="booking-controls">
        <div className="selected-count">
          Вибрано місць: {selectedSeats.size}
        </div>
        <button
          className="booking-button"
          onClick={handleBooking}
          disabled={selectedSeats.size === 0}
        >
          Забронювати ({selectedSeats.size * sessionData?.seatPrice} грн)
        </button>
      </div>
    </div>
  );
};

export default SeatSelection;
