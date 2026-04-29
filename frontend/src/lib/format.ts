import { format, formatDistanceToNow, parseISO } from 'date-fns';

export const money = (valueCents: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(valueCents / 100);

export const shortDate = (input: string | Date) => format(new Date(input), 'dd MMM yyyy');

export const monthLabel = (month: number, year: number) =>
  format(new Date(Date.UTC(year, month - 1, 1)), 'MMM yyyy');

export const relativeTime = (input: string | Date) =>
  formatDistanceToNow(typeof input === 'string' ? parseISO(input) : input, { addSuffix: true });