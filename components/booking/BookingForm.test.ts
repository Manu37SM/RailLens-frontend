import { describe, expect, it } from 'vitest';
import { validatePassengers } from './BookingForm';

describe('passenger checks (same rules as RailOps)', () => {
  const ok = { name: 'Asha Rao', age: '30', gender: 'F' as const };
  it('accepts 1 to 6 sensible passengers', () => {
    expect(validatePassengers([ok])).toBeNull();
    expect(validatePassengers(Array(6).fill(ok))).toBeNull();
  });
  it('refuses empty lists, too many, odd names, impossible ages and missing gender', () => {
    expect(validatePassengers([])).toMatch(/1 to 6/);
    expect(validatePassengers(Array(7).fill(ok))).toMatch(/1 to 6/);
    expect(validatePassengers([{ ...ok, name: 'Robert"); DROP' }])).toMatch(
      /name/
    );
    expect(validatePassengers([{ ...ok, age: '130' }])).toMatch(/age/);
    expect(validatePassengers([{ ...ok, age: '' }])).toMatch(/age/);
    expect(validatePassengers([{ ...ok, gender: '' as const }])).toMatch(
      /gender/
    );
  });
});
