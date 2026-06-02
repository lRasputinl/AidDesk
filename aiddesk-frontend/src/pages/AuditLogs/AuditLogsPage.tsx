import React, { useEffect, useMemo, useState } from 'react';
import auditLogService from '../../api/auditLogService';
import type { AuditLogResponseDTO } from '../../types';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';
import Select from '../../components/ui/Select/Select';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import { formatDate } from '../../utils/formatDate';
import styles from './AuditLogsPage.module.css';

const PAGE_SIZE = 15;

const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [operationFilter, setOperationFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    auditLogService
      .getAll()
      .then(setLogs)
      .catch(() => setError('Ошибка загрузки журнала'))
      .finally(() => setLoading(false));
  }, []);

  // Build unique operation list for the filter dropdown
  const operations = useMemo(() => {
    const unique = Array.from(new Set(logs.map((l) => l.operation))).sort();
    return [
      { value: '', label: 'Все операции' },
      ...unique.map((op) => ({ value: op, label: op })),
    ];
  }, [logs]);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        l.operation.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q);
      const matchesOp = !operationFilter || l.operation === operationFilter;
      return matchesSearch && matchesOp;
    });
  }, [logs, search, operationFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleOpFilter = (val: string) => {
    setOperationFilter(val);
    setPage(1);
  };

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <Input
          placeholder="Поиск по описанию..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className={styles.searchInput}
        />
        <Select
          options={operations}
          value={operationFilter}
          onChange={(e) => handleOpFilter(e.target.value)}
          className={styles.opSelect}
        />
        <span className={styles.count}>
          {loading ? '...' : `${filtered.length} записей`}
        </span>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <Card padding="sm">
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Операция</th>
                <th>Описание</th>
                <th>Тикет</th>
                <th>Автор</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((__, j) => (
                        <td key={j}>
                          <Skeleton height="13px" width={j === 1 ? '200px' : '100px'} />
                        </td>
                      ))}
                    </tr>
                  ))
                : paginated.map((log) => (
                    <tr key={log.id} className={styles.row}>
                      <td>
                        <span className={styles.operation}>{log.operation}</span>
                      </td>
                      <td className={styles.descCell} title={log.description}>
                        {log.description}
                      </td>
                      <td className={styles.idCell}>
                        {log.ticketId ? log.ticketId.slice(0, 8) + '…' : '—'}
                      </td>
                      <td className={styles.idCell}>
                        {log.authorOfChangesId.slice(0, 8)}…
                      </td>
                      <td className={styles.dateCell}>{formatDate(log.createdAt)}</td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {!loading && filtered.length === 0 && (
            <div className={styles.empty}>
              <span>📋</span>
              <p>Записей не найдено</p>
            </div>
          )}
        </div>
      </Card>

      {!loading && totalPages > 1 && (
        <div className={styles.pagination}>
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Назад
          </Button>
          <span className={styles.pageInfo}>
            {page} / {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Вперёд →
          </Button>
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;
