import { TicketStatus, TicketPriority, CommentType } from '../types';

/** Shared select options — used in TicketsPage, SupportPage, CreateTicketPage, TicketDetailsPage */

export const STATUS_SELECT_OPTIONS = [
  { value: TicketStatus.Waiting, label: 'Ожидание' },
  { value: TicketStatus.InProgress, label: 'В процессе' },
  { value: TicketStatus.Done, label: 'Выполнено' },
] as const;

export const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Все статусы' },
  ...STATUS_SELECT_OPTIONS,
] as const;

export const PRIORITY_SELECT_OPTIONS = [
  { value: TicketPriority.Low, label: 'Низкий' },
  { value: TicketPriority.Medium, label: 'Средний' },
  { value: TicketPriority.High, label: 'Высокий' },
] as const;

export const PRIORITY_FILTER_OPTIONS = [
  { value: '', label: 'Все приоритеты' },
  ...PRIORITY_SELECT_OPTIONS,
] as const;

export const COMMENT_TYPE_OPTIONS = [
  { value: CommentType.Public, label: 'Публичный' },
  { value: CommentType.Internal, label: 'Внутренний' },
] as const;

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Сначала новые' },
  { value: 'oldest', label: 'Сначала старые' },
  { value: 'title', label: 'По названию' },
] as const;
