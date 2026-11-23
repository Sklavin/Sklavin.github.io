const MONTHS = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

const DAY = 24 * 60 * 60 * 1000;

function parseDate(value?: string): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function plural(count: number, forms: [string, string, string]) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

export function formatDay(value?: string, now = new Date()): string {
  const date = parseDate(value);
  if (!date) return value ?? '';
  const year = date.getFullYear() === now.getFullYear() ? '' : ` ${date.getFullYear()}`;
  return `${date.getDate()} ${MONTHS[date.getMonth()]}${year}`;
}

export function relativeDay(value?: string, now = new Date()): string {
  const date = parseDate(value);
  if (!date) return value ?? '';
  const days = Math.round((startOfDay(now) - startOfDay(date)) / DAY);
  if (days <= 0) return 'сегодня';
  if (days === 1) return 'вчера';
  if (days < 7) return `${days} ${plural(days, ['день', 'дня', 'дней'])} назад`;
  if (days < 14) return 'на прошлой неделе';
  return formatDay(value, now);
}

export function timeAgo(value?: string, now = Date.now()): string {
  if (!value) return '';
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return '';
  const seconds = Math.max(0, Math.round((now - time) / 1000));
  if (seconds < 60) return 'только что';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} ${plural(minutes, ['минуту', 'минуты', 'минут'])} назад`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} ${plural(hours, ['час', 'часа', 'часов'])} назад`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'вчера';
  if (days < 7) return `${days} ${plural(days, ['день', 'дня', 'дней'])} назад`;
  return formatDay(value.slice(0, 10));
}

export function formatHours(hours: number): string {
  return Math.round(hours).toLocaleString('ru-RU');
}
