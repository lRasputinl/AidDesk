import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTickets } from '../../hooks/useTickets';
import { TicketStatus, TicketPriority } from '../../types';
import { STATUS_FILTER_OPTIONS, PRIORITY_FILTER_OPTIONS } from '../../utils/constants';
import { extractApiError } from '../../utils/apiError';
import ticketService from '../../api/ticketService';
import Badge from '../../components/ui/Badge/Badge';
import Button from '../../components/ui/Button/Button';
import Select from '../../components/ui/Select/Select';
import Input from '../../components/ui/Input/Input';
import Card from '../../components/ui/Card/Card';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import { formatDate } from '../../utils/formatDate';
import styles from './SupportPage.module.css';

const SupportPage: React.FC = () => {
  const { tickets, loading, refetch } = useTickets();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [changingId, setChangingId] = useState<string | null>(null);

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

  const handleQuickStatusChange = async (ticketId: string, newStatus: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    if (!ticket.assignedToId) {
      toast.error('Ошибка обновления статуса: заявка не назначена сотруднику');
      return;
    }

    setChangingId(ticketId);
    try {
      await ticketService.update(ticketId, {
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority ?? TicketPriority.Medium,
        status: newStatus,
        assignedToId: ticket.assignedToId,
      });
      toast.success('Статус обновлён');
      refetch();
    } catch (err: unknown) {
      toast.error(extractApiError(err, 'Ошибка обновления статуса'));
    } finally {
      setChangingId(null);
    }
  };

  const stats = {
    total: tickets.length,
    waiting: tickets.filter((t) => t.status === TicketStatus.Waiting).length,
    inProgress: tickets.filter((t) => t.status === TicketStatus.InProgress).length,
    done: tickets.filter((t) => t.status === TicketStatus.Done).length,
    unassigned: tickets.filter((t) => !t.assignedToId).length,
  };

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
        <Input placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} className={styles.searchInput} />
        <Select options={[...STATUS_FILTER_OPTIONS]} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
        <Select options={[...PRIORITY_FILTER_OPTIONS]} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} />
        <Link to="/tickets/new">
          <Button size="sm">➕ Создать тикет</Button>
        </Link>
      </div>

      {/* Ticket cards */}
      {loading ? (
        <div className={styles.skeletonGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <Skeleton height="18px" width="70%" />
              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                <Skeleton height="22px" width="80px" borderRadius="20px" />
                <Skeleton height="22px" width="60px" borderRadius="20px" />
              </div>
              <Skeleton height="13px" width="120px" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}><span>📭</span><p>Тикеты не найдены</p></div>
      ) : (
        <div className={styles.ticketGrid}>
          {filtered.map((ticket) => (
            <Card key={ticket.id} className={styles.ticketCard} padding="sm">
              <div className={styles.cardTop}>
                <Link to={`/tickets/${ticket.id}`} className={styles.cardTitle}>
                  {ticket.title}
                </Link>
                <div className={styles.cardBadges}>
                  <Badge label={ticket.status} type="status" />
                  {ticket.priority && <Badge label={ticket.priority} type="priority" />}
                </div>
              </div>
              <p className={styles.cardDesc}>{ticket.description}</p>
              <div className={styles.cardFooter}>
                <span className={styles.cardDate}>{formatDate(ticket.createdAt)}</span>
                <div className={styles.quickActions}>
                  {ticket.status !== TicketStatus.InProgress && (
                    <Button variant="ghost" size="sm" loading={changingId === ticket.id} onClick={() => handleQuickStatusChange(ticket.id, TicketStatus.InProgress)}>
                      В процессе
                    </Button>
                  )}
                  {ticket.status !== TicketStatus.Done && (
                    <Button variant="ghost" size="sm" loading={changingId === ticket.id} onClick={() => handleQuickStatusChange(ticket.id, TicketStatus.Done)}>
                      Выполнено
                    </Button>
                  )}
                  <Link to={`/tickets/${ticket.id}`}>
                    <Button variant="secondary" size="sm">Открыть</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupportPage;
