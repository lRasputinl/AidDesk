/**
 * Human-readable labels for ticket statuses and priorities.
 * The API values stay in English; only the UI labels are translated.
 */

export const STATUS_LABELS: Record<string, string> = {
  Waiting: 'Ожидание',
  'In progress': 'В процессе',
  Done: 'Выполнено',
};

export const PRIORITY_LABELS: Record<string, string> = {
  Low: 'Низкий',
  Medium: 'Средний',
  High: 'Высокий',
};

export function statusLabel(value: string): string {
  return STATUS_LABELS[value] ?? value;
}

export function priorityLabel(value: string): string {
  return PRIORITY_LABELS[value] ?? value;
}
