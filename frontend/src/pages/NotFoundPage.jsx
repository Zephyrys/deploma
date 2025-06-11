import { Link } from 'react-router-dom';
import '../styles/NotFoundPage.css'
const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <h2>404 - Сторінку не знайдено</h2>
      <p>На жаль, сторінка, яку ви шукаєте, не існує.</p>
      <Link to="/">Повернутися на головну</Link>
    </div>
  );
};

export default NotFoundPage;
