import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getHalls, createHall, updateHall, deleteHall, getCinemas } from '../../services/api';

const defaultAmenities = ['3D', 'Dolby Atmos', 'IMAX', 'Recliners', 'VIP'];

export default function HallAdmin() {
  const [halls, setHalls] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [hallForm, setHallForm] = useState({
    _id: null,
    name: '',
    cinemaId: '',
    rows: '',
    seatsPerRow: '',
    amenities: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hallsData, cinemasData] = await Promise.all([getHalls(), getCinemas()]);
        setHalls(hallsData);
        setCinemas(cinemasData);
      } catch (err) {
        toast.error('Помилка при завантаженні даних: ', err);
      }
    };
    fetchData();
  }, []);

  const onHallChange = (e) => {
    const { name, value } = e.target;
    if (name === 'rows' || name === 'seatsPerRow') {
      setHallForm((f) => ({ ...f, [name]: value === '' ? '' : value }));
    } else {
      setHallForm((f) => ({ ...f, [name]: value }));
    }
  };

  const toggleAmenity = (amenity) => {
    setHallForm((f) => ({
      ...f,
      amenities: f.amenities.includes(amenity)
        ? f.amenities.filter((a) => a !== amenity)
        : [...f.amenities, amenity],
    }));
  };

  const generateSeats = (rows, seatsPerRow) => {
    const seatArray = [];
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < seatsPerRow; j++) {
        row.push({ isOccupied: false, userId: null });
      }
      seatArray.push(row);
    }
    return seatArray;
  };

  const onHallSubmit = async (e) => {
    e.preventDefault();
    const { _id, name, cinemaId, rows, seatsPerRow, amenities } = hallForm;
    const hallData = {
      name,
      cinemaId,
      seats: generateSeats(Number(rows), Number(seatsPerRow)),
      amenities,
    };
    try {
      if (_id) {
        await updateHall(_id, hallData);
        toast.success('Зал успішно оновлено');
      } else {
        await createHall(hallData);
        toast.success('Зал успішно створено');
      }
      const updatedHalls = await getHalls();
      setHalls(updatedHalls);
      setHallForm({
        _id: null,
        name: '',
        cinemaId: '',
        rows: '',
        seatsPerRow: '',
        amenities: [],
      });
    } catch (error) {
      console.error('Помилка при збереженні залу:', error);
      toast.error('Помилка при збереженні залу');
    }
  };

  const onHallEdit = (hall) => {
    setHallForm({
      _id: hall._id,
      name: hall.name,
      cinemaId: typeof hall.cinemaId === 'object' ? hall.cinemaId._id : hall.cinemaId,
      rows: hall.seats.length.toString(),
      seatsPerRow: hall.seats[0]?.length.toString() || '',
      amenities: hall.amenities || [],
    });
  };

  const onHallDelete = async (id) => {
    try {
      await deleteHall(id);
      setHalls((prev) => prev.filter((h) => h._id !== id));
      toast.success('Зал успішно видалено');
    } catch (error) {
      console.error('Помилка при видаленні залу:', error);
      toast.error('Помилка при видаленні залу');
    }
  };

  return (
    <section>
      <h2>Управління залами</h2>
      <form onSubmit={onHallSubmit}>
        <input
          name="name"
          placeholder="Назва"
          value={hallForm.name}
          onChange={onHallChange}
          required
        />
        <select
          name="cinemaId"
          value={hallForm.cinemaId}
          onChange={onHallChange}
          required
        >
          <option value="">Виберіть кінотеатр</option>
          {cinemas.map((cinema) => (
            <option key={cinema._id} value={cinema._id}>
              {cinema.name}
            </option>
          ))}
        </select>
        <input
          name="rows"
          type="number"
          placeholder="Кількість рядів"
          value={hallForm.rows}
          onChange={onHallChange}
          required
        />
        <input
          name="seatsPerRow"
          type="number"
          placeholder="Місць у ряду"
          value={hallForm.seatsPerRow}
          onChange={onHallChange}
          required
        />
        <div>
          <label>Зручності:</label>
          {defaultAmenities.map((amenity) => (
            <label key={amenity} style={{ marginRight: '1em' }}>
              <input
                type="checkbox"
                checked={hallForm.amenities.includes(amenity)}
                onChange={() => toggleAmenity(amenity)}
              />
              {amenity}
            </label>
          ))}
        </div>
        <button type="submit">{hallForm._id ? 'Оновити' : 'Створити'}</button>
        {hallForm._id && (
          <button
            type="button"
            onClick={() =>
              setHallForm({
                _id: null,
                name: '',
                cinemaId: '',
                rows: '',
                seatsPerRow: '',
                amenities: [],
              })
            }
          >
            Скинути
          </button>
        )}
      </form>

      <h3>Список залів</h3>
      <table>
        <thead>
          <tr>
            <th>Назва</th>
            <th>Кінотеатр</th>
            <th>Рядів x Місць</th>
            <th>Зручності</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {halls.map((hall) => (
            <tr key={hall._id}>
              <td>{hall.name}</td>
              <td>{hall.cinemaId?.name}</td>
              <td>{hall.seats.length} x {hall.seats[0]?.length || 0}</td>
              <td>{hall.amenities?.join(', ')}</td>
              <td>
                <button onClick={() => onHallEdit(hall)}>Редагувати</button>
                <button onClick={() => onHallDelete(hall._id)} className={'delete-button'}>Видалити</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
