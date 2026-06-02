import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTickets } from '../../hooks/useTickets';
import { TicketStatus } from '../../types';
import Card from '../../components/ui/Card/Card';
import Badge from '../../components/ui/Badge/Badge';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import { formatDate } from '../../utils/formatDate';
import styles from './DashboardPage.module.css';

// ─── Stat Card ───

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  color: 'primary' | 'warning' | 'info' | 'success';
  loading: boolean;
}

const COLOR_MAP: Record<StatCardProps['color'], string> = {
  primary: '#4f46e5',
  warning: '#f59e0b',
  info: '#3b82f6',
  success: '#10b981',
};

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, loading }) => (
  <Card className={styles.statCard}>
    <div className={styles.statIcon} style={{ background: COLOR_MAP[color] + '18' }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
    </div>
    <div className={styles.statBody}>
      <span className={styles.statLabel}>{label}</span>
      {loading ? (
        <Skeleton width="48px" height="28px" />
      ) : (
        <span className={styles.statValue} style={{ color: COLOR_MAP[color] }}>
          {value}
        </span>
      )}
    </div>
  </Card>
);

// ─── Page ───

const DashboardPage: React.FC = () => {
  const { isSupport, isManager, isAdmin, displayName } = useAuth();
  const { tickets, loading } = useTickets();

  const stats = {
    total: tickets.length,
    waiting: tickets.filter((t) => t.status === TicketStatus.Waiting).length,
    inProgress: tickets.filter((t) => t.status === TicketStatus.InProgress).length,
    done: tickets.filter((t) => t.status === TicketStatus.Done).length,
  };

  const recent = [...tickets]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className={styles.page}>
      <div className={styles.welcome}>
        <h2 className={styles.welcomeTitle}>
          Добро пожаловать{displayName ? `, ${displayName}` : ''}!
        </h2>
        <p className={styles.welcomeSub}>
          {isAdmin ? 'Полное управление системой' : isManager ? 'Управление всеми заявками системы' : isSupport ? 'Ваши назначенные заявки' : 'Обзор ваших обращений в поддержку'}
        </p>
      </div>

      <div className={styles.statsGrid}>
        <StatCard label="Всего тикетов" value={stats.total} icon="🎫" color="primary" loading={loading} />
        <StatCard label="Ожидают" value={stats.waiting} icon="⏳" color="warning" loading={loading} />
        <StatCard label="В работе" value={stats.inProgress} icon="🔧" color="info" loading={loading} />
        <StatCard label="Выполнено" value={stats.done} icon="✅" color="success" loading={loading} />
      </div>

      <Card>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Последние тикеты</h3>
          <Link to="/tickets" className={styles.viewAll}>Все тикеты →</Link>
        </div>

        {loading ? (
          <div className={styles.skeletonList}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.skeletonRow}>
                <Skeleton width="40%" height="16px" />
                <Skeleton width="80px" height="22px" borderRadius="20px" />
                <Skeleton width="100px" height="14px" />
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📭</span>
            <p>Тикетов пока нет</p>
            {!isSupport && (
              <Link to="/tickets/new" className={styles.createLink}>
                Создать первый тикет
              </Link>
            )}
          </div>
        ) : (
          <div className={styles.ticketList}>
            {recent.map((ticket) => (
              <Link key={ticket.id} to={`/tickets/${ticket.id}`} className={styles.ticketRow}>
                <div className={styles.ticketInfo}>
                  <span className={styles.ticketTitle}>{ticket.title}</span>
                  <span className={styles.ticketDate}>{formatDate(ticket.createdAt)}</span>
                </div>
                <div className={styles.ticketMeta}>
                  <Badge label={ticket.status} type="status" />
                  {ticket.priority && <Badge label={ticket.priority} type="priority" />}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default DashboardPage;
