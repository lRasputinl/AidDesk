import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import styles from './Sidebar.module.css';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  roles?: Role[];
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Дашборд', icon: '📊' },
  { to: '/tickets', label: 'Мои тикеты', icon: '🎫', roles: [Role.Client] },
  { to: '/tickets', label: 'Мои заявки', icon: '🎫', roles: [Role.Support] },
  { to: '/tickets/new', label: 'Создать тикет', icon: '➕', roles: [Role.Client] },
  // Manager: all tickets, create, users — NO audit
  { to: '/manager', label: 'Все заявки', icon: '🗂️', roles: [Role.Manager] },
  { to: '/tickets/new', label: 'Создать заявку', icon: '➕', roles: [Role.Manager] },
  { to: '/users', label: 'Пользователи', icon: '👥', roles: [Role.Manager] },
  // Admin: same as Manager + audit
  { to: '/manager', label: 'Все заявки', icon: '🗂️', roles: [Role.Admin] },
  { to: '/tickets/new', label: 'Создать заявку', icon: '➕', roles: [Role.Admin] },
  { to: '/users', label: 'Пользователи', icon: '👥', roles: [Role.Admin] },
  { to: '/audit-logs', label: 'Аудит', icon: '📋', roles: [Role.Admin] },
  { to: '/profile', label: 'Профиль', icon: '👤' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, displayEmail, displayName, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    onClose();
  };

  const visibleItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role)),
  );

  return (
    <aside className={[styles.sidebar, isOpen ? styles.sidebarOpen : ''].join(' ')}>
      {/* Logo */}
      <div className={styles.logo}>
        <span className={styles.logoIcon}>🎯</span>
        <span className={styles.logoText}>AidDesk</span>
        {/* Mobile close button */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Закрыть меню">
          ✕
        </button>
      </div>

      {/* User info */}
      <div className={styles.userInfo}>
        <div className={styles.avatar}>
          {(displayName || displayEmail).charAt(0).toUpperCase()}
        </div>
        <div className={styles.userDetails}>
          {displayName
            ? <span className={styles.userName}>{displayName}</span>
            : null}
          <span className={styles.userEmail}>{displayEmail}</span>
          <span className={styles.userRole}>{user?.role}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.nav} aria-label="Основная навигация">
        <ul className={styles.navList}>
          {visibleItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  [styles.navLink, isActive ? styles.navLinkActive : ''].join(' ')
                }
                end={item.to === '/dashboard'}
                onClick={handleNavClick}
              >
                <span className={styles.navIcon} aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <button className={styles.logoutBtn} onClick={handleLogout}>
        <span aria-hidden="true">🚪</span>
        Выйти
      </button>
    </aside>
  );
};

export default Sidebar;
