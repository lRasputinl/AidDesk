import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useUsers } from '../../hooks/useUsers';
import ticketService from '../../api/ticketService';
import { Role } from '../../types';
import { STATUS_SELECT_OPTIONS, PRIORITY_SELECT_OPTIONS } from '../../utils/constants';
import Textarea from '../../components/ui/Textarea/Textarea';
import Select from '../../components/ui/Select/Select';
import Input from '../../components/ui/Input/Input';
import Button from '../../components/ui/Button/Button';
import Card from '../../components/ui/Card/Card';
import styles from './CreateTicketPage.module.css';
import { extractApiError } from '../../utils/apiError';

// ─── FAQ data ───

const FAQ_ITEMS = [
  {
    question: 'Как правильно описать проблему?',
    answer:
      'Укажите, что именно не работает, в каком разделе системы возникла проблема и какие действия вы выполняли перед её появлением. Чем подробнее описание — тем быстрее мы сможем помочь.',
  },
  {
    question: 'Что такое приоритет заявки?',
    answer:
      'Приоритет определяет срочность обработки: «Высокий» — критическая проблема, блокирующая работу; «Средний» — важная, но не блокирующая; «Низкий» — пожелание или незначительная ошибка.',
  },
  {
    question: 'Как долго рассматривается заявка?',
    answer:
      'Заявки с высоким приоритетом обрабатываются в течение 2 часов, со средним — до 1 рабочего дня, с низким — до 3 рабочих дней. Вы получите уведомление при изменении статуса.',
  },
  {
    question: 'Могу ли я добавить комментарий к заявке?',
    answer:
      'Да. После создания заявки откройте её страницу и воспользуйтесь формой комментариев внизу. Вы можете уточнить детали или ответить на вопросы сотрудника поддержки.',
  },
  {
    question: 'Что означают статусы заявки?',
    answer:
      '«Ожидание» — заявка принята и ожидает назначения; «В процессе» — сотрудник работает над решением; «Выполнено» — проблема решена.',
  },
  {
    question: 'Как отследить статус моей заявки?',
    answer:
      'Перейдите в раздел «Тикеты» — там отображаются все ваши заявки с текущими статусами. Нажмите на заявку, чтобы увидеть подробности и историю изменений.',
  },
];

// ─── FAQ Accordion ───

const FaqAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <Card className={styles.faqCard}>
      <h3 className={styles.faqTitle}>Часто задаваемые вопросы</h3>
      <div className={styles.faqList}>
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} className={styles.faqItem}>
            <button
              className={[styles.faqQuestion, openIndex === i ? styles.faqQuestionOpen : ''].join(' ')}
              onClick={() => toggle(i)}
              aria-expanded={openIndex === i}
            >
              <span>{item.question}</span>
              <span className={styles.faqChevron} aria-hidden="true">
                {openIndex === i ? '▲' : '▼'}
              </span>
            </button>
            {openIndex === i && (
              <div className={styles.faqAnswer}>
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

// ─── Page ───

const CreateTicketPage: React.FC = () => {
  const { isManager, isAdmin } = useAuth();
  const canCreateForClient = isManager || isAdmin;
  const navigate = useNavigate();

  const { users } = useUsers();
  const supportUsers = users.filter((u) => u.role === Role.Support);
  const clientUsers = users.filter((u) => u.role === Role.Client);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<string>('Medium');
  const [status, setStatus] = useState<string>('Waiting');
  const [assignedToId, setAssignedToId] = useState('');
  const [createdForClientId, setCreatedForClientId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; description?: string; createdForClientId?: string }>({});

  const validate = () => {
    const errs: typeof errors = {};
    if (!title.trim()) errs.title = 'Введите название';
    else if (title.length > 150) errs.title = 'Максимум 150 символов';
    if (!description.trim()) errs.description = 'Введите описание';
    else if (description.length > 1000) errs.description = 'Максимум 1000 символов';
    if (canCreateForClient && !createdForClientId) errs.createdForClientId = 'Выберите клиента';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      let newTicket;
      if (canCreateForClient) {
        newTicket = await ticketService.createByManager({
          title,
          description,
          priority,
          status,
          assignedToId: assignedToId || null,
          createdForClientId: createdForClientId || null,
        });
      } else {
        newTicket = await ticketService.createByClient({ title, description });
      }
      toast.success('Тикет создан!');
      navigate(`/tickets/${newTicket.id}`);
    } catch (err: unknown) {
      toast.error(extractApiError(err, 'Ошибка создания тикета'));
    } finally {
      setLoading(false);
    }
  };

  const supportOptions = [
    { value: '', label: '— Не назначен —' },
    ...supportUsers.map((u) => ({
      value: u.id,
      label: `${u.firstName} ${u.lastName} (${u.email})`,
    })),
  ];

  const clientOptions = [
    { value: '', label: '— Не выбран —' },
    ...clientUsers.map((u) => ({
      value: u.id,
      label: `${u.firstName} ${u.lastName} (${u.email})`,
    })),
  ];

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        {/* Form */}
        <Card className={styles.card}>
          <h2 className={styles.cardTitle}>Новый тикет</h2>
          <p className={styles.cardSub}>
            {canCreateForClient
              ? 'Создайте тикет от имени клиента с полными параметрами'
              : 'Опишите вашу проблему — мы постараемся помочь как можно скорее'}
          </p>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <Input
              label="Название *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={errors.title}
              placeholder="Кратко опишите проблему"
              maxLength={150}
            />
            <Textarea
              label="Описание *"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={errors.description}
              placeholder="Подробно опишите проблему, шаги воспроизведения, ожидаемый результат..."
              rows={6}
              maxLength={1000}
            />
            <div className={styles.charCount}>
              {description.length}/1000
            </div>

            {canCreateForClient && (
              <div className={styles.supportFields}>
                <Select
                  label="Приоритет"
                  options={[...PRIORITY_SELECT_OPTIONS]}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                />
                <Select
                  label="Статус"
                  options={[...STATUS_SELECT_OPTIONS]}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                />
                <Select
                  label="Назначить сотруднику (Support)"
                  options={supportOptions}
                  value={assignedToId}
                  onChange={(e) => setAssignedToId(e.target.value)}
                />
                <Select
                  label="Создать от имени клиента (Client) *"
                  options={clientOptions}
                  value={createdForClientId}
                  onChange={(e) => setCreatedForClientId(e.target.value)}
                  error={errors.createdForClientId}
                />
              </div>
            )}

            <div className={styles.formActions}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Отмена
              </Button>
              <Button type="submit" loading={loading}>
                Создать тикет
              </Button>
            </div>
          </form>
        </Card>

        {/* FAQ — shown only for clients */}
        {!canCreateForClient && <FaqAccordion />}
      </div>
    </div>
  );
};

export default CreateTicketPage;
