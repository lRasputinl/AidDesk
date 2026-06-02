import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import userService from '../../api/userService';
import type { UserResponseDTO } from '../../types';
import { extractApiError } from '../../utils/apiError';
import Input from '../../components/ui/Input/Input';
import Button from '../../components/ui/Button/Button';
import Card from '../../components/ui/Card/Card';
import Spinner from '../../components/ui/Spinner/Spinner';
import { formatDate } from '../../utils/formatDate';
import styles from './ProfilePage.module.css';

// ─── Profile form ───

interface ProfileFormProps {
  profile: UserResponseDTO;
  onSaved: (updated: UserResponseDTO) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ profile, onSaved }) => {
  const { refreshDisplayEmail, refreshDisplayName } = useAuth();

  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [email, setEmail] = useState(profile.email);
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = 'Введите имя';
    if (!lastName.trim()) errs.lastName = 'Введите фамилию';
    if (!email) errs.email = 'Введите email';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Некорректный email';
    if (!phoneNumber.trim()) errs.phoneNumber = 'Введите номер телефона';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const updated = await userService.updateMe({ firstName, lastName, email, phoneNumber });
      onSaved(updated);
      refreshDisplayEmail(updated.email);
      refreshDisplayName(`${updated.firstName} ${updated.lastName}`);
      toast.success('Профиль обновлён');
    } catch (err: unknown) {
      const backendMsg = extractApiError(err, '');
      let displayMsg: string;
      if (backendMsg.includes('Email') || backendMsg.includes('email') || backendMsg.includes('почт')) {
        displayMsg = 'Ошибка обновления: электронная почта уже используется';
      } else if (backendMsg.includes('телефон') || backendMsg.includes('Телефон') || backendMsg.includes('phone')) {
        displayMsg = 'Ошибка обновления: номер телефона уже используется';
      } else {
        displayMsg = backendMsg || 'Ошибка обновления';
      }
      toast.error(displayMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <h2 className={styles.formTitle}>Редактировать профиль</h2>
      <p className={styles.formSub}>Обновите ваши личные данные</p>
      <form onSubmit={handleSave} className={styles.form} noValidate>
        <div className={styles.row}>
          <Input label="Имя" value={firstName} onChange={(e) => setFirstName(e.target.value)} error={errors.firstName} placeholder="Иван" />
          <Input label="Фамилия" value={lastName} onChange={(e) => setLastName(e.target.value)} error={errors.lastName} placeholder="Иванов" />
        </div>
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <Input label="Номер телефона" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} error={errors.phoneNumber} placeholder="+7 (999) 000-00-00" />
        <div className={styles.formActions}>
          <Button type="submit" loading={saving}>Сохранить изменения</Button>
        </div>
      </form>
    </Card>
  );
};

// ─── Password form ───

const PasswordForm: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!currentPassword) errs.currentPassword = 'Введите текущий пароль';
    if (!newPassword) errs.newPassword = 'Введите новый пароль';
    else if (newPassword.length < 6) errs.newPassword = 'Минимум 6 символов';
    if (!confirmPassword) errs.confirmPassword = 'Подтвердите новый пароль';
    else if (newPassword !== confirmPassword) errs.confirmPassword = 'Пароли не совпадают';
    if (currentPassword && newPassword && currentPassword === newPassword)
      errs.newPassword = 'Новый пароль должен отличаться от текущего';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await userService.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
      toast.success('Пароль успешно изменён');
    } catch (err: unknown) {
      const msg = extractApiError(err, 'Ошибка смены пароля');
      if (msg.includes('Текущий пароль')) {
        setErrors({ currentPassword: msg });
      } else {
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <h2 className={styles.formTitle}>Безопасность</h2>
      <p className={styles.formSub}>Смените пароль для защиты аккаунта</p>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <Input label="Текущий пароль" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} error={errors.currentPassword} placeholder="••••••••" autoComplete="current-password" />
        <Input label="Новый пароль" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} error={errors.newPassword} placeholder="Минимум 6 символов" autoComplete="new-password" />
        <Input label="Подтвердите новый пароль" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} error={errors.confirmPassword} placeholder="••••••••" autoComplete="new-password" />
        <div className={styles.formActions}>
          <Button type="submit" loading={saving}>Сменить пароль</Button>
        </div>
      </form>
    </Card>
  );
};

// ─── Page ───

const ProfilePage: React.FC = () => {
  const { user, displayEmail, displayName, logout, refreshDisplayName } = useAuth();
  const [profile, setProfile] = useState<UserResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    userService
      .getMe()
      .then((data) => {
        setProfile(data);
        refreshDisplayName(`${data.firstName} ${data.lastName}`);
      })
      .catch(() => {/* profile stays null; form still works */})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (loading) return <Spinner centered size="lg" />;

  const shownEmail = profile?.email ?? displayEmail;
  const shownName = displayName || `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim() || shownEmail;
  const avatarInitial = shownName.charAt(0).toUpperCase();

  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        {/* Avatar / info card */}
        <Card className={styles.avatarCard}>
          <div className={styles.avatar}>{avatarInitial}</div>
          <div className={styles.avatarInfo}>
            {shownName !== shownEmail && (
              <span className={styles.avatarName}>{shownName}</span>
            )}
            <span className={styles.avatarEmail}>{shownEmail}</span>
            <span className={styles.avatarRole}>{user?.role}</span>
          </div>
          {profile && (
            <dl className={styles.metaList}>
              <dt>Имя</dt>
              <dd>{profile.firstName} {profile.lastName}</dd>
              <dt>Телефон</dt>
              <dd>{profile.phoneNumber}</dd>
              <dt>Зарегистрирован</dt>
              <dd>{formatDate(profile.createdAt)}</dd>
            </dl>
          )}
          <Button variant="danger" size="sm" fullWidth onClick={logout} className={styles.logoutBtn}>
            Выйти из аккаунта
          </Button>
        </Card>

        {/* Right column */}
        <div className={styles.rightCol}>
          {profile
            ? <ProfileForm profile={profile} onSaved={setProfile} />
            : (
              <Card>
                <h2 className={styles.formTitle}>Редактировать профиль</h2>
                <p className={styles.formSub}>Не удалось загрузить данные профиля</p>
              </Card>
            )
          }
          <PasswordForm />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
