import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useUsers } from '../../hooks/useUsers';
import userService from '../../api/userService';
import { useAuth } from '../../context/AuthContext';
import { extractApiError } from '../../utils/apiError';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';
import Select from '../../components/ui/Select/Select';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import ConfirmDialog from '../../components/ui/ConfirmDialog/ConfirmDialog';
import Badge from '../../components/ui/Badge/Badge';
import { formatDate } from '../../utils/formatDate';
import { Role } from '../../types';
import styles from './UsersPage.module.css';

const ROLE_OPTIONS_MANAGER = [
  { value: 'Client', label: 'Client' },
  { value: 'Support', label: 'Support' },
];

const ROLE_OPTIONS_ADMIN = [
  { value: 'Client', label: 'Client' },
  { value: 'Support', label: 'Support' },
  { value: 'Manager', label: 'Manager' },
  { value: 'Admin', label: 'Admin' },
];

const UsersPage: React.FC = () => {
  const { user: currentUser, isAdmin } = useAuth();
  const { users, loading, error, refetch } = useUsers();

  // Admin can assign any role; Manager can only assign Client/Support
  const roleOptions = isAdmin ? ROLE_OPTIONS_ADMIN : ROLE_OPTIONS_MANAGER;

  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await userService.delete(deleteTarget);
      toast.success('Пользователь удалён');
      refetch();
    } catch (err: unknown) {
      toast.error(extractApiError(err, 'Ошибка удаления'));
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setChangingRoleId(userId);
    try {
      await userService.changeRole(userId, newRole);
      toast.success('Роль изменена');
      refetch();
    } catch (err: unknown) {
      toast.error(extractApiError(err, 'Ошибка изменения роли'));
    } finally {
      setChangingRoleId(null);
    }
  };

  const targetUser = users.find((u) => u.id === deleteTarget);

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <Input
          placeholder="Поиск по имени или email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <span className={styles.count}>
          {loading ? '...' : `${filtered.length} пользователей`}
        </span>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <Card padding="sm">
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Имя</th>
                <th>Email</th>
                <th>Роль</th>
                <th>Телефон</th>
                <th>Зарегистрирован</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j}>
                          <Skeleton height="14px" width={j === 0 ? '140px' : '100px'} />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.map((u) => (
                    <tr key={u.id} className={styles.row}>
                      <td>
                        <div className={styles.nameCell}>
                          <div className={styles.avatar}>
                            {u.firstName.charAt(0)}{u.lastName.charAt(0)}
                          </div>
                          <div>
                            <div className={styles.fullName}>{u.firstName} {u.lastName}</div>
                            <div className={styles.userId}>{u.id.slice(0, 8)}…</div>
                          </div>
                        </div>
                      </td>
                      <td className={styles.emailCell}>{u.email}</td>
                      <td>
                        {u.id !== currentUser?.id &&
                        !(
                          !isAdmin &&
                          (u.role === Role.Admin || u.role === Role.Manager)
                        ) ? (
                          <Select
                            options={roleOptions}
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className={styles.roleSelect}
                          />
                        ) : (
                          <Badge label={u.role} type="role" />
                        )}
                      </td>
                      <td className={styles.phoneCell}>{u.phoneNumber}</td>
                      <td className={styles.dateCell}>{formatDate(u.createdAt)}</td>
                      <td>
                        {/* Only Admin can delete users */}
                        {u.id !== currentUser?.id && isAdmin && (
                          <Button
                            variant="danger"
                            size="sm"
                            loading={changingRoleId === u.id}
                            onClick={() => setDeleteTarget(u.id)}
                          >
                            Удалить
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {!loading && filtered.length === 0 && (
            <div className={styles.empty}>
              <span>👥</span>
              <p>Пользователи не найдены</p>
            </div>
          )}
        </div>
      </Card>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Удалить пользователя"
        message={
          targetUser
            ? `Вы уверены, что хотите удалить пользователя ${targetUser.firstName} ${targetUser.lastName} (${targetUser.email})?`
            : 'Удалить пользователя?'
        }
        loading={deleting}
      />
    </div>
  );
};

export default UsersPage;
