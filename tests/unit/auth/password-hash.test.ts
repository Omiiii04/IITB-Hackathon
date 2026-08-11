import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '@/modules/auth/auth.service';

describe('Password Hashing — hashPassword / verifyPassword', () => {
  it('hashPassword returns a non-empty string that is not the plaintext', async () => {
    const plain = 'SecurePass1';
    const hash = await hashPassword(plain);

    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
    expect(hash).not.toBe(plain);
  });

  it('hashPassword produces a recognisable Argon2id hash prefix', async () => {
    const hash = await hashPassword('TestPassword9');
    // Argon2id hashes always start with $argon2id$
    expect(hash.startsWith('$argon2id$')).toBe(true);
  });

  it('two calls with the same password produce different hashes (salt)', async () => {
    const plain = 'SamePassword9A';
    const hash1 = await hashPassword(plain);
    const hash2 = await hashPassword(plain);
    // Argon2 generates a unique random salt per call
    expect(hash1).not.toBe(hash2);
  });

  it('verifyPassword returns true for the correct password', async () => {
    const plain = 'CorrectPassword1';
    const hash = await hashPassword(plain);
    const result = await verifyPassword(hash, plain);
    expect(result).toBe(true);
  });

  it('verifyPassword returns false for the wrong password', async () => {
    const plain = 'CorrectPassword1';
    const hash = await hashPassword(plain);
    const result = await verifyPassword(hash, 'WrongPassword9');
    expect(result).toBe(false);
  });

  it('verifyPassword returns false for a malformed/garbage hash', async () => {
    // Must NOT throw — callers rely on the false return to treat all verify
    // failures uniformly without leaking which case occurred.
    const result = await verifyPassword('not-a-valid-hash', 'AnyPassword1');
    expect(result).toBe(false);
  });

  it('verifyPassword returns false for an empty string as the password', async () => {
    const hash = await hashPassword('RealPassword1');
    const result = await verifyPassword(hash, '');
    expect(result).toBe(false);
  });
});
