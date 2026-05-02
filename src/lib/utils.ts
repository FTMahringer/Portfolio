export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(dateStr: string): string {
  const [year, month] = dateStr.split('-');
  return month ? `${MONTHS[parseInt(month) - 1]} ${year}` : year;
}

export function formatDateRange(start: string, end: string | null): string {
  return `${formatDate(start)} – ${end ? formatDate(end) : 'Present'}`;
}
