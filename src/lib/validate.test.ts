import { describe, it, expect } from 'vitest';
import { isValidCPF, isValidMatricula, isValidEmail } from './validate';

describe('isValidCPF', () => {
  it('accepts a valid CPF', () => {
    expect(isValidCPF('529.982.247-25')).toBe(true);
    expect(isValidCPF('52998224725')).toBe(true);
  });
  it('rejects invalid CPFs', () => {
    expect(isValidCPF('111.111.111-11')).toBe(false);
    expect(isValidCPF('123.456.789-00')).toBe(false);
    expect(isValidCPF('123')).toBe(false);
    expect(isValidCPF('')).toBe(false);
    expect(isValidCPF(null)).toBe(false);
  });
});

describe('isValidMatricula', () => {
  it('accepts 4-8 digit matrículas', () => {
    expect(isValidMatricula('1234')).toBe(true);
    expect(isValidMatricula('12345678')).toBe(true);
    expect(isValidMatricula('123456')).toBe(true);
  });
  it('rejects invalid matrículas', () => {
    expect(isValidMatricula('123')).toBe(false);
    expect(isValidMatricula('123456789')).toBe(false);
    expect(isValidMatricula('')).toBe(false);
    expect(isValidMatricula(null)).toBe(false);
  });
});

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('a.b+c@sub.dominio.com.br')).toBe(true);
  });
  it('rejects invalid emails', () => {
    expect(isValidEmail('foo')).toBe(false);
    expect(isValidEmail('foo@bar')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});
