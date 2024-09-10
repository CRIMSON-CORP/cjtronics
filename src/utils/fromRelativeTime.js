export function formatRelativeTime(date) {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const now = new Date();
  const diffInSeconds = Math.floor((date - now) / 1000);

  const units = [
    { unit: 'year', value: 60 * 60 * 24 * 365 }, // Approximation for a year
    { unit: 'month', value: 60 * 60 * 24 * 30 }, // Approximation for a month
    { unit: 'week', value: 60 * 60 * 24 * 7 },
    { unit: 'day', value: 60 * 60 * 24 },
    { unit: 'hour', value: 60 * 60 },
    { unit: 'minute', value: 60 },
    { unit: 'second', value: 1 },
  ];

  for (const { unit, value } of units) {
    if (Math.abs(diffInSeconds) >= value) {
      const amount = Math.floor(diffInSeconds / value);
      return rtf.format(amount, unit);
    }
  }

  return rtf.format(0, 'second'); // Default to "now" if difference is less than a second
}
