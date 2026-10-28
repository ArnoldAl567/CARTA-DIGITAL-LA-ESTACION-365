import { isBusinessOpen } from './business-hours';

describe('business hours in Peru', () => {
  it('opens Monday through Saturday from 9:00 until 23:00', () => {
    expect(isBusinessOpen(new Date('2026-10-26T13:59:00Z'))).toBeFalse(); // lunes 8:59
    expect(isBusinessOpen(new Date('2026-10-26T14:00:00Z'))).toBeTrue();  // lunes 9:00
    expect(isBusinessOpen(new Date('2026-10-27T03:59:00Z'))).toBeTrue();  // lunes 22:59
    expect(isBusinessOpen(new Date('2026-10-27T04:00:00Z'))).toBeFalse(); // lunes 23:00
    expect(isBusinessOpen(new Date('2026-10-31T14:00:00Z'))).toBeTrue();  // sábado 9:00
  });

  it('opens Sunday from 9:00 until 23:00', () => {
    expect(isBusinessOpen(new Date('2026-11-01T13:59:00Z'))).toBeFalse(); // domingo 8:59
    expect(isBusinessOpen(new Date('2026-11-01T14:00:00Z'))).toBeTrue();  // domingo 9:00
    expect(isBusinessOpen(new Date('2026-11-02T03:59:00Z'))).toBeTrue();  // domingo 22:59
    expect(isBusinessOpen(new Date('2026-11-02T04:00:00Z'))).toBeFalse(); // domingo 23:00
  });
});
