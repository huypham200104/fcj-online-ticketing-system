import crypto from 'crypto';

const ITERATIONS = 310000;
const KEY_LENGTH = 32;
const DIGEST = 'sha256';
const FORMAT = 'pbkdf2';

function toBuffer(value) {
  return Buffer.from(value, 'hex');
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
  return `${FORMAT}$${ITERATIONS}$${salt}$${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== 'string') return false;

  const [format, iterationsText, salt, expectedHash] = storedHash.split('$');
  const iterations = Number(iterationsText);

  if (format !== FORMAT || !Number.isInteger(iterations) || !salt || !expectedHash) {
    return false;
  }

  const actualHash = crypto.pbkdf2Sync(password, salt, iterations, KEY_LENGTH, DIGEST).toString('hex');
  const actual = toBuffer(actualHash);
  const expected = toBuffer(expectedHash);

  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}
