import { useState } from 'react';
import MovieAdmin from '../components/Admin/MovieAdmin';
import SessionAdmin from '../components/Admin/SessionAdmin';
import HallAdmin from '../components/Admin/HallAdmin';
import CinemaAdmin from '../components/Admin/CinemaAdmin';
import UserAdmin from '../components/Admin/UserAdmin';
import BookingAdmin from '../components/Admin/BookingAdmin';  
import '../styles/AdminPanel.css';

export default function AdminPage() {
  const [tab, setTab] = useState('movies');

  return (
    <div className="admin-page">
      <h1>Адмін-панель</h1>
      <nav className="admin-nav">
        <button
          className={tab === 'movies' ? 'active' : ''}
          onClick={() => setTab('movies')}
        >
          Фільми
        </button>
        <button
          className={tab === 'sessions' ? 'active' : ''}
          onClick={() => setTab('sessions')}
        >
          Сеанси
        </button>
        <button
          className={tab === 'halls' ? 'active' : ''}
          onClick={() => setTab('halls')}
        >
          Зали
        </button>
        <button
          className={tab === 'cinemas' ? 'active' : ''}
          onClick={() => setTab('cinemas')}
        >
          Кінотеатри
        </button>
        <button
          className={tab === 'users' ? 'active' : ''}
          onClick={() => setTab('users')}
        >
          Користувачі
        </button>
        <button
          className={tab === 'bookings' ? 'active' : ''}
          onClick={() => setTab('bookings')}
        >
          Бронювання
        </button>
      </nav>

      {tab === 'movies' && (
        <section className="admin-section movies-section">
          <MovieAdmin />
        </section>
      )}
      {tab === 'sessions' && (
        <section className="admin-section sessions-section">
          <SessionAdmin />
        </section>
      )}
      {tab === 'halls' && (
        <section className="admin-section hall-admin">
          <HallAdmin />
        </section>
      )}
      {tab === 'cinemas' && (
        <section className="admin-section cinema-admin">
          <CinemaAdmin />
        </section>
      )}
      {tab === 'users' && (
        <section className="admin-section users-admin">
          <UserAdmin />
        </section>
      )}
      {tab === 'bookings' && (
        <section className="admin-section booking-admin">
          <BookingAdmin />
        </section>
      )}
    </div>
  );
}
