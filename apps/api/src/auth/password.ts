import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

// ponytail: node:crypto scrypt instead of a bcrypt/argon2 dependency. scrypt is a
// memory-hard, adaptive KDF in the stdlib and meets the spec's "hash with configurable
// cost, never plaintext" requirement with zero deps. Cost tunable via SCRYPT_COST (N).
// Swap for argon2 only if a threat model demands it.
const COST = Number(process.env.SCRYPT_COST ?? 16384); // N, must be power of 2
const KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, KEYLEN, { N: COST });
  return `scrypt$${COST}$${salt.toString('hex')}$${derived.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, costStr, saltHex, hashHex] = stored.split('$');
  if (scheme !== 'scrypt') return false;
  const derived = scryptSync(password, Buffer.from(saltHex, 'hex'), KEYLEN, {
    N: Number(costStr),
  });
  const expected = Buffer.from(hashHex, 'hex');
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}
