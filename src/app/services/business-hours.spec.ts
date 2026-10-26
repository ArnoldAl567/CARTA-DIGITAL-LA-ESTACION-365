import { isBusinessOpen } from './business-hours';

describe('business hours in Peru', () => {
  it('opens Monday through Saturday from 11:00 until 23:00', () => {
    expect(isBusinessOpen(new Date('2026-10-26T15:59:00Z'))).toBeFalse(); // lunes 10:59
    expect(isBusinessOpen(new Date('2026-10-26T16:00:00Z'))).toBeTrue();  // lunes 11:00
    expect(isBusinessOpen(new Date('2026-10-27T03:59:00Z'))).toBeTrue();  // lunes 22:59
    expect(isBusinessOpen(new Date('2026-10-27T04:00:00Z'))).toBeFalse(); // lunes 23:00
    expect(isBusinessOpen(new Date('2026-10-31T16:00:00Z'))).toBeTrue();  // sábado 11:00
  });

  it('closes Sunday at 18:00', () => {
    expect(isBusinessOpen(new Date('2026-11-01T15:59:00Z'))).toBeFalse(); // domingo 10:59
    expect(isBusinessOpen(new Date('2026-11-01T16:00:00Z'))).toBeTrue();  // domingo 11:00
    expect(isBusinessOpen(new Date('2026-11-01T22:59:00Z'))).toBeTrue();  // domingo 17:59
    expect(isBusinessOpen(new Date('2026-11-01T23:00:00Z'))).toBeFalse(); // domingo 18:00
  });
});
