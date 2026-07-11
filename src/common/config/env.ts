import dotenv from 'dotenv';
dotenv.config();

/**
 * Parse ALLOWED_ORIGINS — supports single origin, comma-separated list, or wildcard '*'.
 */
function parseAllowedOrigins(): string | string[] {
  const raw = process.env.ALLOWED_ORIGINS || '*';
  const origins = raw.split(',').map((s) => s.trim()).filter(Boolean);
  if (origins.length === 0) return '*';
  return origins.length === 1 ? origins[0] : origins;
}

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/finora',
  ALLOWED_ORIGINS: parseAllowedOrigins(),
} as const;
