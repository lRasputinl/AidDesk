import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { extractApiError } from '../../utils/apiError';
import Input from '../../components/ui/Input/Input';
import Button from '../../components/ui/Button/Button';
import styles from './RegisterPage.module.css';

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
}

const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.firstName.trim()) errs.firstName = 'Введите имя';
    if (!form.lastName.trim()) errs.lastName = 'Введите фамилию';
    if (!form.email) errs.email = 'Введите email';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Некорректный email';
    if (!form.phoneNumber.trim()) errs.phoneNumber = 'Введите номер телефона';
    if (!form.password) errs.password = 'Введите пароль';
    else if (form.password.length < 6) errs.password = 'Минимум 6 символов';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Пароли не совпадают';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        password: form.password,
      });
      toast.success('Аккаунт создан! Войдите в систему.');
      navigate('/login');
    } catch (err: unknown) {
      toast.error(extractApiError(err, 'Ошибка регистрации'));
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
        <h1 className={styles.title}>Регистрация</h1>
        <p className={styles.subtitle}>Создайте аккаунт клиента</p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.row}>
            <Input
              label="Имя"
              value={form.firstName}
              onChange={set('firstName')}
              error={errors.firstName}
              placeholder="Иван"
              autoComplete="given-name"
            />
            <Input
              label="Фамилия"
              value={form.lastName}
              onChange={set('lastName')}
              error={errors.lastName}
              placeholder="Иванов"
              autoComplete="family-name"
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <Input
            label="Номер телефона"
            type="tel"
            value={form.phoneNumber}
            onChange={set('phoneNumber')}
            error={errors.phoneNumber}
            placeholder="+7 (999) 000-00-00"
            autoComplete="tel"
          />
          <Input
            label="Пароль"
            type="password"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          <Input
            label="Подтвердите пароль"
            type="password"
            value={form.confirmPassword}
            onChange={set('confirmPassword')}
            error={errors.confirmPassword}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          <Button type="submit" fullWidth loading={loading} size="lg">
            Зарегистрироваться
          </Button>
        </form>

        <p className={styles.footer}>
          Уже есть аккаунт?{' '}
          <Link to="/login" className={styles.link}>
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
