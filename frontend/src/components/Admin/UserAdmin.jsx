import { useEffect, useState } from 'react';
import { getUsers, deleteUser, updateUser } from '../../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function UserAdmin() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch(() => toast.error('Не вдалося завантажити користувачів'));
  }, []);

  const onUserDelete = async id => {
    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      toast.success('Користувача успішно видалено');
    } catch (error) {
      console.error('Помилка при видаленні користувача:', error);
      toast.error('Помилка при видаленні користувача');
    }
  };

  const onRoleChange = async (userId, newRole) => {
    try {
      const updatedUser = await updateUser(userId, { role: newRole });
      setUsers(prev =>
        prev.map(user =>
          user._id === userId ? { ...user, role: updatedUser.role } : user
        )
      );
      toast.success('Роль користувача оновлено');
    } catch (error) {
      console.error('Помилка при зміні ролі:', error);
      toast.error('Помилка при зміні ролі користувача');
    }
  };

  return (
    <section>
      <h2>Управління користувачами</h2>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Поточна роль</th>
            <th>Нова роль</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.email}</td>
              <td>
                <strong>{user.role}</strong>
              </td>
              <td>
                <select
                  value={user.role}
                  onChange={e => onRoleChange(user._id, e.target.value)}
                >
                  <option value="client">Client</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>
                <button onClick={() => onUserDelete(user._id)} className="delete-button">
                  Видалити
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>


    </section>
  );
}
