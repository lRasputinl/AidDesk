import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useTicket } from '../../hooks/useTickets';
import { useComments } from '../../hooks/useComments';
import { useTicketHistory } from '../../hooks/useTicketHistory';
import { useUsers } from '../../hooks/useUsers';
import { TicketPriority, CommentType, Role } from '../../types';
import {
  STATUS_SELECT_OPTIONS,
  PRIORITY_SELECT_OPTIONS,
  COMMENT_TYPE_OPTIONS,
} from '../../utils/constants';
import { extractApiError } from '../../utils/apiError';
import ticketService from '../../api/ticketService';
import commentService from '../../api/commentService';
import Badge from '../../components/ui/Badge/Badge';
import Button from '../../components/ui/Button/Button';
import Card from '../../components/ui/Card/Card';
import Spinner from '../../components/ui/Spinner/Spinner';
import Textarea from '../../components/ui/Textarea/Textarea';
import Select from '../../components/ui/Select/Select';
import ConfirmDialog from '../../components/ui/ConfirmDialog/ConfirmDialog';
import Modal from '../../components/ui/Modal/Modal';
import Input from '../../components/ui/Input/Input';
import { formatDate, timeAgo } from '../../utils/formatDate';
import styles from './TicketDetailsPage.module.css';

const TicketDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSupport, isManager, isAdmin, user } = useAuth();
  const canManage = isManager || isAdmin; // Manager and Admin can edit/delete/assign

  const { ticket, loading: ticketLoading, refetch: refetchTicket } = useTicket(id!);
  const { comments, loading: commentsLoading, refetch: refetchComments } = useComments(id!);
  const { history, loading: historyLoading, refetch: refetchHistory } = useTicketHistory(id!);

  // Users list only needed for Manager/Admin (assignee dropdown)
  const { users: allUsers } = useUsers();
  const supportUsers = canManage ? allUsers.filter((u) => u.role === Role.Support) : [];

  // ─── Comment form ───────────────────────────────────────────────────────────
  const [commentText, setCommentText] = useState('');
  const [commentType, setCommentType] = useState<string>(CommentType.Public);
  const [submittingComment, setSubmittingComment] = useState(false);

  // ─── Support: quick status change ──────────────────────────────────────────
  const [newStatus, setNewStatus] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  // ─── Manager: edit modal ────────────────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editAssignedTo, setEditAssignedTo] = useState('');
  const [saving, setSaving] = useState(false);

  // ─── Manager: delete dialog ─────────────────────────────────────────────────
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const openEdit = () => {
    if (!ticket) return;
    setEditTitle(ticket.title);
    setEditDesc(ticket.description);
    setEditStatus(ticket.status);
    setEditPriority(ticket.priority ?? TicketPriority.Medium);
    setEditAssignedTo(ticket.assignedToId ?? '');
    setEditOpen(true);
  };

  // Support: change status only
  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !newStatus) return;
    setSavingStatus(true);
    try {
      await ticketService.updateStatus(ticket.id, { status: newStatus });
      toast.success('Статус обновлён');
      refetchTicket();
      refetchHistory();
    } catch (err: unknown) {
      toast.error(extractApiError(err, 'Ошибка обновления статуса'));
    } finally {
      setSavingStatus(false);
    }
  };

  // Manager: full edit
  const handleSave = async () => {
    if (!ticket) return;
    setSaving(true);
    try {
      await ticketService.update(ticket.id, {
        title: editTitle,
        description: editDesc,
        status: editStatus,
        priority: editPriority,
        assignedToId: editAssignedTo.trim() || null,
      });
      toast.success('Тикет обновлён');
      setEditOpen(false);
      refetchTicket();
      refetchHistory();
    } catch (err: unknown) {
      toast.error(extractApiError(err, 'Ошибка обновления тикета'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!ticket) return;
    setDeleting(true);
    try {
      await ticketService.delete(ticket.id);
      toast.success('Тикет удалён');
      navigate('/manager');
    } catch (err: unknown) {
      toast.error(extractApiError(err, 'Ошибка удаления тикета'));
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !id) return;
    setSubmittingComment(true);
    try {
      // Support, Manager, and Admin can post typed comments; Client posts public only
      if (isSupport || canManage) {
        await commentService.createBySupport(id, { text: commentText, type: commentType });
      } else {
        await commentService.createByClient(id, { text: commentText });
      }
      setCommentText('');
      toast.success('Комментарий добавлен');
      refetchComments();
    } catch (err: unknown) {
      toast.error(extractApiError(err, 'Ошибка добавления комментария'));
    } finally {
      setSubmittingComment(false);
    }
  };

  const assigneeOptions = [
    { value: '', label: '— Не назначен —' },
    ...supportUsers.map((u) => ({
      value: u.id,
      label: `${u.firstName} ${u.lastName} (${u.email})`,
    })),
  ];

  if (ticketLoading) return <Spinner centered size="lg" />;
  if (!ticket) return <div className={styles.notFound}>Тикет не найден</div>;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>← Назад</button>
        {/* Manager and Admin can edit and delete */}
        {canManage && (
          <div className={styles.actions}>
            <Button variant="secondary" size="sm" onClick={openEdit}>✏️ Редактировать</Button>
            <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>🗑️ Удалить</Button>
          </div>
        )}
      </div>

      <div className={styles.grid}>
        <div className={styles.main}>
          <Card>
            <div className={styles.ticketHeader}>
              <h2 className={styles.ticketTitle}>{ticket.title}</h2>
              <div className={styles.badges}>
                <Badge label={ticket.status} type="status" />
                {ticket.priority && <Badge label={ticket.priority} type="priority" />}
              </div>
            </div>
            <p className={styles.description}>{ticket.description}</p>

            {/* Support: quick status change panel */}
            {isSupport && (
              <form onSubmit={handleStatusChange} className={styles.statusForm}>
                <Select
                  label="Изменить статус"
                  options={STATUS_SELECT_OPTIONS.filter((o) => o.value !== ticket.status)}
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  placeholder="Выберите новый статус"
                />
                <Button type="submit" size="sm" loading={savingStatus} disabled={!newStatus}>
                  Обновить статус
                </Button>
              </form>
            )}
          </Card>

          <Card>
            <h3 className={styles.sectionTitle}>Комментарии ({comments.length})</h3>
            {commentsLoading ? (
              <Spinner centered />
            ) : comments.length === 0 ? (
              <p className={styles.noComments}>Комментариев пока нет</p>
            ) : (
              <div className={styles.commentList}>
                {comments.map((c) => {
                  const isOwn = c.authorId === user?.id;
                  // "public" (lowercase) = client comment; "Публичный"/"Внутренний" = staff comment
                  const isClientComment = c.type === 'public';
                  const authorLabel = isOwn ? 'Вы' : isClientComment ? 'Клиент' : 'Сотрудник';
                  return (
                    <div
                      key={c.id}
                      className={[
                        styles.comment,
                        isOwn ? styles.commentOwn : '',
                        c.type === CommentType.Internal ? styles.commentInternal : '',
                      ].filter(Boolean).join(' ')}
                    >
                      <div className={styles.commentMeta}>
                        <span className={styles.commentAuthor}>{authorLabel}</span>
                        <Badge label={c.type} type="comment" />
                        <span className={styles.commentTime}>{timeAgo(c.createdAt)}</span>
                      </div>
                      <p className={styles.commentText}>{c.text}</p>
                    </div>
                  );
                })}
              </div>
            )}

            <form onSubmit={handleAddComment} className={styles.commentForm}>
              <Textarea
                placeholder="Написать комментарий..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
              />
              {/* Support, Manager, and Admin can choose comment type */}
              {(isSupport || canManage) && (
                <Select
                  options={[...COMMENT_TYPE_OPTIONS]}
                  value={commentType}
                  onChange={(e) => setCommentType(e.target.value)}
                />
              )}
              <Button type="submit" loading={submittingComment} disabled={!commentText.trim()}>
                Отправить
              </Button>
            </form>
          </Card>
        </div>

        <div className={styles.sidebar}>
          <Card>
            <h3 className={styles.sectionTitle}>Информация</h3>
            <dl className={styles.infoList}>
              <dt>ID</dt>
              <dd className={styles.idValue}>{ticket.id.slice(0, 8)}…</dd>
              <dt>Создан</dt>
              <dd>{formatDate(ticket.createdAt)}</dd>
              <dt>Обновлён</dt>
              <dd>{formatDate(ticket.updatedAt)}</dd>
              <dt>Автор</dt>
              <dd className={styles.idValue}>{ticket.createdById.slice(0, 8)}…</dd>
              {ticket.assignedToId && (
                <>
                  <dt>Назначен</dt>
                  <dd className={styles.idValue}>{ticket.assignedToId.slice(0, 8)}…</dd>
                </>
              )}
            </dl>
          </Card>

          <Card>
            <h3 className={styles.sectionTitle}>История статусов</h3>
            {historyLoading ? (
              <Spinner centered size="sm" />
            ) : history.length === 0 ? (
              <p className={styles.noComments}>История пуста</p>
            ) : (
              <div className={styles.historyList}>
                {history.map((h) => (
                  <div key={h.id} className={styles.historyItem}>
                    <div className={styles.historyStatuses}>
                      <Badge label={h.oldStatus} type="status" />
                      <span className={styles.arrow}>→</span>
                      <Badge label={h.newStatus} type="status" />
                    </div>
                    <span className={styles.historyDate}>{formatDate(h.changedAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Manager: full edit modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Редактировать тикет" size="md">
        <div className={styles.editForm}>
          <Input label="Название" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
          <Textarea label="Описание" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={4} />
          <Select label="Статус" options={[...STATUS_SELECT_OPTIONS]} value={editStatus} onChange={(e) => setEditStatus(e.target.value)} />
          <Select label="Приоритет" options={[...PRIORITY_SELECT_OPTIONS]} value={editPriority} onChange={(e) => setEditPriority(e.target.value)} />
          <Select label="Назначенный сотрудник" options={assigneeOptions} value={editAssignedTo} onChange={(e) => setEditAssignedTo(e.target.value)} />
          <div className={styles.editActions}>
            <Button variant="secondary" onClick={() => setEditOpen(false)} disabled={saving}>Отмена</Button>
            <Button onClick={handleSave} loading={saving}>Сохранить</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        message={`Вы уверены, что хотите удалить тикет "${ticket.title}"? Это действие необратимо.`}
        loading={deleting}
      />
    </div>
  );
};

export default TicketDetailsPage;
