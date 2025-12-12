import type { CustomScheduleItemInput } from '../types/sales';

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'custom_days';

export function formatDateISO(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function generateSchedule(
  total: number,
  startDateStr: string,
  opts: { frequency: Frequency; intervalDays?: number; count: number }
): CustomScheduleItemInput[] {
  const start = new Date(startDateStr);
  const count = Math.max(1, Math.floor(opts.count || 1));
  const perRaw = total / count;
  const per = Math.round(perRaw * 100) / 100;
  const schedule: CustomScheduleItemInput[] = [];

  for (let i = 0; i < count; i++) {
    let due: Date;
    if (opts.frequency === 'daily') {
      due = addDays(start, i);
    } else if (opts.frequency === 'weekly') {
      due = addDays(start, i * 7);
    } else if (opts.frequency === 'monthly') {
      due = addMonths(start, i);
    } else {
      const step = Math.max(1, opts.intervalDays || 1);
      due = addDays(start, i * step);
    }
    schedule.push({ amount: per, due_date: formatDateISO(due) });
  }

  // Adjust last payment to ensure exact total
  const sumExceptLast = schedule.slice(0, -1).reduce((s, it) => s + it.amount, 0);
  schedule[schedule.length - 1].amount = Math.round((total - sumExceptLast) * 100) / 100;

  return schedule;
}



export const getCurrentDate = (date = new Date())=> {
    // 2. Get the local date and time parts
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    // 3. Combine them into the final string
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}