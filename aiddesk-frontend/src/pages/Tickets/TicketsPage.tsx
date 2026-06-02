import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTickets } from '../../hooks/useTickets';
import { STATUS_FILTER_OPTIONS, PRIORITY_FILTER_OPTIONS, SORT_OPTIONS } from '../../utils/constants';
import Badge from '../../components/ui/Badge/Badge';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';
import Select from '../../components/ui/Select/Select';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import { formatDate } from '../../utils/formatDate';
import styles from './TicketsPage.module.css';

const PAGE_SIZE = 10;

const TicketsPage: React.FC = () => {
  const { isClient } = useAuth();
  const { tickets, loading, error } = useTickets();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = [...tickets];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
      );
    }
    if (statusFilter) result = result.filter((t) => t.status === statusFilter);
    if (priorityFilter) result = result.filter((t) => t.priority === priorityFilter);
    result.sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return a.title.localeCompare(b.title);
    });
    return result;
  }, [tickets, search, statusFilter, priorityFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setSort('newest');
    setPage(1);
  };

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <Input
            placeholder="Поиск по названию..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className={styles.searchInput}
          />
          <Select options={[...STATUS_FILTER_OPTIONS]} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} />
          <Select options={[...PRIORITY_FILTER_OPTIONS]} value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }} />
          <Select options={[...SORT_OPTIONS]} value={sort} onChange={(e) => setSort(e.target.value)} />
          {(search || statusFilter || priorityFilter) && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>Сбросить</Button>
          )}
        </div>
        {isClient && (
          <Link to="/tickets/new" className={styles.createBtnDesktop}>
            <Button size="sm">➕ Создать тикет</Button>
          </Link>
        )}
      </div>

      {isClient && (
        <Link to="/tickets/new" className={styles.createBtnMobile}>
          <Button size="sm" fullWidth>➕ Создать тикет</Button>
        </Link>
      )}

      <div className={styles.tableWrapper}>
        {error ? (
          <div className={styles.error}>Ошибка загрузки: {error}</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Название</th>
                <th>Статус</th>
                <th>Приоритет</th>
                <th>Создан</th>
                <th>Обновлён</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j}><Skeleton height="14px" width={j === 0 ? '160px' : '80px'} /></td>
                      ))}
                    </tr>
                  ))
                : paginated.map((ticket) => (
                    <tr key={ticket.id} className={styles.row}>
                      <td className={styles.titleCell}>
                        <Link to={`/tickets/${ticket.id}`} className={styles.titleLink}>
                          {ticket.title}
                        </Link>
                      </td>
                      <td><Badge label={ticket.status} type="status" /></td>
                      <td>
                        {ticket.priority
                          ? <Badge label={ticket.priority} type="priority" />
                          : <span className={styles.na}>—</span>}
                      </td>
                      <td className={styles.dateCell}>{formatDate(ticket.createdAt)}</td>
                      <td className={styles.dateCell}>{formatDate(ticket.updatedAt)}</td>
                      <td>
                        <Link to={`/tickets/${ticket.id}`}>
                          <Button variant="ghost" size="sm">Открыть</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className={styles.empty}><span>📭</span><p>Тикеты не найдены</p></div>
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className={styles.pagination}>
          <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Назад</Button>
          <span className={styles.pageInfo}>Страница {page} из {totalPages}</span>
          <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Вперёд →</Button>
        </div>
      )}
    </div>
  );
};

export default TicketsPage;
