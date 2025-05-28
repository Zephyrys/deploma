// import React, { useState, useEffect } from 'react';
// import { getSessions } from '../services/api';
// import '../styles/SessionSelection.css';
// import { Link } from 'react-router-dom';

// const SessionSelection = () => {
//   const [sessions, setSessions] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchSessions = async () => {
//       setIsLoading(true);
//       setError(null);
//       try {
//         const data = await getSessions();
//         console.log('Отримані сеанси:', data);
//         setSessions(data);
//       } catch (error) {
//         console.error('Помилка при завантаженні сеансів:', error);
//         setError('Не вдалося завантажити сеанси. Спробуйте ще раз.');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchSessions();
//   }, []);

//   if (error) {
//     return <div className="error">{error}</div>;
//   }

//   if (isLoading) {
//     return <div>Завантаження сеансів...</div>;
//   }

//   return (
//     <div className="session-selection">
//       <h2>Виберіть сеанс</h2>
//       <ul>
//         {sessions.map((session) => {
//           const startTime = new Date(session.startTime).toLocaleString();
//           const endTime = new Date(session.endTime).toLocaleString();
//           const availableSeats = session.seats.flat().filter(seat => !seat).length;
//           const cinema = session.hallId?.cinemaId;
//           const hall = session.hallId;

//           return (
//             <li key={session._id} className="session-card">
//               <div className="movie-info">
//                 <h3>{session.movieId.title}</h3>
//                 <p className="genre">{session.movieId.genre}</p>
//                 <p className="duration">Тривалість: {session.movieId.duration} хв</p>
//               </div>

//               <div className="cinema-info">
//                 <h4>{cinema?.name}</h4>
//                 <p>Адреса: {cinema?.location}</p>
//                 <p>Зал: {hall?.name}</p>
//                 <p>Технології: {hall?.amenities?.join(', ')}</p>
//                 <p>Години роботи: {cinema?.openingHours}</p>
//               </div>

//               <div className="session-time">
//                 <p>Початок: {startTime}</p>
//                 <p>Закінчення: {endTime}</p>
//                 <p className="seats-available">Вільних місць: {availableSeats}</p>
//               </div>

//               <Link
//                 to={{pathname:`/seats/${session._id}`}}
//                 state={session.seats}
//                 className="select-button"
//               >
//                 Вибрати місця
//               </Link>
//             </li>
//           );
//         })}
//       </ul>
//     </div>
//   );
// };

// export default SessionSelection;
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SeatSelection = () => {
  const location = useLocation();
  const [seats, setSeats] = useState([]);

  useEffect(() => {
    console.log('Отримано дані для місць:', location.state);
    if (location.state) {
      setSeats(location.state); // Зберігаємо отримані місця
    } else {
      console.error('Не вдалося отримати дані для місць');
    }
  }, [location.state]);

  return (
    <div>
      <h2>Вибір місць</h2>
      {seats.length > 0 ? (
        <ul>
          {seats.map((seat, index) => (
            <li key={index}>Місце: {seat}</li>
          ))}
        </ul>
      ) : (
        <p>Немає місць для вибору.</p>
      )}
    </div>
  );
};

export default SeatSelection;
