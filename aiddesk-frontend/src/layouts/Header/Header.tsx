import React from 'react';
import { useLocation } from 'react-router-dom';
import styles from './Header.module.css';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Дашборд',
  '/tickets': 'Тикеты',
  '/tickets/new': 'Создать тикет',
  '/support': 'Мои заявки',
  '/manager': 'Все заявки',
  '/users': 'Пользователи',
  '/audit-logs': 'Журнал аудита',
  '/profile': 'Профиль',
};

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const location = useLocation();

  const title =
    Object.entries(pageTitles)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([path]) => location.pathname.startsWith(path))?.[1] ?? 'AidDesk';

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {/* Hamburger — visible on mobile only */}
        <button
          className={styles.menuBtn}
          onClick={onMenuClick}
          aria-label="Открыть меню"
        >
          ☰
        </button>
        <h1 className={styles.title}>{title}</h1>
      </div>
      <div className={styles.right}>
        <span className={styles.date}>
          {new Date().toLocaleDateString('ru-RU', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </span>
      </div>
    </header>
  );
};

export default Header;
