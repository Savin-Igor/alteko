import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const SALT_LENGTH = 16
const TAG_LENGTH = 16
const KEY_LENGTH = 32

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error('NEXTAUTH_SECRET is not set — cannot encrypt/decrypt sensitive data')
  return secret
}

function deriveKey(salt: Buffer): Buffer {
  return scryptSync(getSecret(), salt, KEY_LENGTH)
}

// Output format: iv (16 bytes) || salt (16 bytes) || tag (16 bytes) || encrypted (n bytes), base64
export function encrypt(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH)
  const salt = randomBytes(SALT_LENGTH)
  const key = deriveKey(salt)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, salt, tag, encrypted]).toString('base64')
}

export function decrypt(ciphertext: string): string {
  const data = Buffer.from(ciphertext, 'base64')
  const iv = data.subarray(0, IV_LENGTH)
  const salt = data.subarray(IV_LENGTH, IV_LENGTH + SALT_LENGTH)
  const tag = data.subarray(IV_LENGTH + SALT_LENGTH, IV_LENGTH + SALT_LENGTH + TAG_LENGTH)
  const encrypted = data.subarray(IV_LENGTH + SALT_LENGTH + TAG_LENGTH)
  const key = deriveKey(salt)
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}
