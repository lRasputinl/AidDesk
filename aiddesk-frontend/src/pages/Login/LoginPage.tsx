import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { extractApiError } from '../../utils/apiError';
import Input from '../../components/ui/Input/Input';
import Button from '../../components/ui/Button/Button';
import styles from './LoginPage.module.css';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!email) errs.email = 'Введите email';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Некорректный email';
    if (!password) errs.password = 'Введите пароль';
    else if (password.length < 6) errs.password = 'Минимум 6 символов';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login({ email, password });
      toast.success('Добро пожаловать!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const backendMsg = extractApiError(err, '');
      let displayMsg: string;
      if (backendMsg.includes('не найден') || backendMsg.includes('не существует')) {
        displayMsg = 'Ошибка входа: введён некорректный email';
      } else if (backendMsg.includes('пароль') || backendMsg.includes('Неверный')) {
        displayMsg = 'Ошибка входа: введён некорректный пароль';
      } else {
        displayMsg = backendMsg || 'Ошибка входа';
      }
      toast.error(displayMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoRow}>
          <span className={styles.logoIcon}>🎯</span>
          <span className={styles.logoText}>AidDesk</span>
        </div>
        <h1 className={styles.title}>Вход в систему</h1>
        <p className={styles.subtitle}>Введите данные вашего аккаунта</p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <Input
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <Button type="submit" fullWidth loading={loading} size="lg">
            Войти
          </Button>
        </form>

        <p className={styles.footer}>
          Нет аккаунта?{' '}
          <Link to="/register" className={styles.link}>
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
