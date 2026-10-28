/** Horario de La Estación 365, siempre evaluado en la hora local de Perú. */
export function isBusinessOpen(at: Date = new Date()): boolean {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Lima',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(at);
  const hour = Number(parts.find(part => part.type === 'hour')?.value);
  const minute = Number(parts.find(part => part.type === 'minute')?.value);
  const time = hour * 60 + minute;
  return time >= 9 * 60 && time < 23 * 60;
}
