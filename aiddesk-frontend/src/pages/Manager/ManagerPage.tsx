import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTickets } from '../../hooks/useTickets';
import { useUsers } from '../../hooks/useUsers';
import { TicketStatus, Role } from '../../types';
import { STATUS_FILTER_OPTIONS, PRIORITY_FILTER_OPTIONS, PRIORITY_SELECT_OPTIONS } from '../../utils/constants';
import { extractApiError } from '../../utils/apiError';
import ticketService from '../../api/ticketService';
import Badge from '../../components/ui/Badge/Badge';
import Button from '../../components/ui/Button/Button';
import Select from '../../components/ui/Select/Select';
import Input from '../../components/ui/Input/Input';
import Card from '../../components/ui/Card/Card';
import Modal from '../../components/ui/Modal/Modal';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import { formatDate } from '../../utils/formatDate';
import styles from './ManagerPage.module.css';

const ManagerPage: React.FC = () => {
  const { tickets, loading, refetch } = useTickets();
  const { users } = useUsers();
  const supportUsers = users.filter((u) => u.role === Role.Support);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignTicketId, setAssignTicketId] = useState('');
  const [assignTicketTitle, setAssignTicketTitle] = useState('');
  const [assignSupportId, setAssignSupportId] = useState('');
  const [assignPriority, setAssignPriority] = useState('');
  const [assigning, setAssigning] = useState(false);

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
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tickets, search, statusFilter, priorityFilter]);

  const openAssign = (ticketId: string, title: string, currentAssignee: string | null, currentPriority: string) => {
    setAssignTicketId(ticketId);
    setAssignTicketTitle(title);
    setAssignSupportId(currentAssignee ?? '');
    setAssignPriority(currentPriority);
    setAssignOpen(true);
  };

  const handleAssign = async () => {
    setAssigning(true);
    try {
      await ticketService.assign(assignTicketId, {
        assignedToId: assignSupportId || null,
        priority: assignPriority || null,
      });
      toast.success('Заявка обновлена');
      setAssignOpen(false);
      refetch();
    } catch (err: unknown) {
      toast.error(extractApiError(err, 'Ошибка назначения'));
    } finally {
      setAssigning(false);
    }
  };

  const stats = {
    total: tickets.length,
    waiting: tickets.filter((t) => t.status === TicketStatus.Waiting).length,
    inProgress: tickets.filter((t) => t.status === TicketStatus.InProgress).length,
    done: tickets.filter((t) => t.status === TicketStatus.Done).length,
    unassigned: tickets.filter((t) => !t.assignedToId).length,
  };

  const assigneeOptions = [
    { value: '', label: '— Не назначен —' },
    ...supportUsers.map((u) => ({
      value: u.id,
      label: `${u.firstName} ${u.lastName} (${u.email})`,
    })),
  ];

  return (
    <div className={styles.page}>
      {/* Stats */}
      <div className={styles.statsRow}>
        {[
          { label: 'Всего', value: stats.total, color: '#4f46e5' },
          { label: 'Ожидают', value: stats.waiting, color: '#f59e0b' },
          { label: 'В работе', value: stats.inProgress, color: '#3b82f6' },
          { label: 'Выполнено', value: stats.done, color: '#10b981' },
          { label: 'Без назначения', value: stats.unassigned, color: '#ef4444' },
        ].map((s) => (
          <Card key={s.label} className={styles.statCard} padding="sm">
            <span className={styles.statValue} style={{ color: s.color }}>
              {loading ? '—' : s.value}
            </span>
            <span className={styles.statLabel}>{s.label}</span>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <Input
          placeholder="Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <Select options={[...STATUS_FILTER_OPTIONS]} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
        <Select options={[...PRIORITY_FILTER_OPTIONS]} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} />
        <Link to="/tickets/new">
          <Button size="sm">➕ Создать заявку</Button>
        </Link>
      </div>

      {/* Ticket table */}
      <Card padding="sm">
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Название</th>
                <th>Статус</th>
                <th>Приоритет</th>
                <th>Назначен</th>
                <th>Создан</th>
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
                : filtered.map((ticket) => {
                    const assignee = supportUsers.find((u) => u.id === ticket.assignedToId);
                    return (
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
                        <td className={styles.assigneeCell}>
                          {assignee
                            ? `${assignee.firstName} ${assignee.lastName}`
                            : <span className={styles.unassigned}>Не назначен</span>}
                        </td>
                        <td className={styles.dateCell}>{formatDate(ticket.createdAt)}</td>
                        <td>
                          <div className={styles.rowActions}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openAssign(ticket.id, ticket.title, ticket.assignedToId, ticket.priority ?? '')}
                            >
                              Назначить
                            </Button>
                            <Link to={`/tickets/${ticket.id}`}>
                              <Button variant="secondary" size="sm">Открыть</Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className={styles.empty}><span>📭</span><p>Заявки не найдены</p></div>
          )}
        </div>
      </Card>

      {/* Assign modal */}
      <Modal isOpen={assignOpen} onClose={() => setAssignOpen(false)} title="Назначить заявку" size="sm">
        <div className={styles.assignForm}>
          <p className={styles.assignTitle}>{assignTicketTitle}</p>
          <Select
            label="Сотрудник (Support)"
            options={assigneeOptions}
            value={assignSupportId}
            onChange={(e) => setAssignSupportId(e.target.value)}
          />
          <Select
            label="Приоритет"
            options={[{ value: '', label: '— Без изменений —' }, ...PRIORITY_SELECT_OPTIONS]}
            value={assignPriority}
            onChange={(e) => setAssignPriority(e.target.value)}
          />
          <div className={styles.assignActions}>
            <Button variant="secondary" onClick={() => setAssignOpen(false)} disabled={assigning}>
              Отмена
            </Button>
            <Button onClick={handleAssign} loading={assigning}>
              Сохранить
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManagerPage;
