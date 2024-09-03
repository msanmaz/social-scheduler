import { randomBytes } from 'crypto';

function generateSecureKey() {
  // Generate a 256-bit (32-byte) random key
  const key = randomBytes(32);
  // Convert to Base64 for storage/transmission
  return key.toString('base64');
}

const secureKey = generateSecureKey();
console.log('Your new secure JWT_SECRET (save this securely):', secureKey);