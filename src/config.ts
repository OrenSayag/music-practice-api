import 'dotenv/config';
import { cleanEnv, str, num } from 'envalid';

const env = cleanEnv(process.env, {
  DATABASE_URL: str(),
  AUTH_SECRET: str(),
  AUTH_URL: str(),
  GOOGLE_CLIENT_ID: str(),
  GOOGLE_CLIENT_SECRET: str(),
  AI_PROVIDER: str({ choices: ['openai', 'anthropic'] }),
  AI_API_KEY: str(),
  AI_MODEL: str(),
  PRACTICE_PLAN_CHAT_SYSTEM_PROMPT_FILE_PATH: str(),
  FRONTEND_URL: str({ default: '' }),
  PORT: num(),
  NODE_ENV: str({ default: 'development' }),
  LOG_LEVEL: str({ default: 'info' }),
  RATE_LIMIT_WINDOW_MS: num({ default: 900000 }),
  RATE_LIMIT_MAX_REQUESTS: num({ default: 100 }),
  SESSION_MAX_AGE_SECONDS: num({ default: 30 * 24 * 60 * 60 }),
  S3_ENDPOINT: str({ default: 'http://localhost:9000' }),
  S3_ACCESS_KEY: str({ default: 'minioadmin' }),
  S3_SECRET_KEY: str({ default: 'minioadmin' }),
  S3_BUCKET: str({ default: 'recordings' }),
  S3_REGION: str({ default: 'us-east-1' }),
  GUEST_MAX_RECORDINGS: num({ default: 3 }),
  GUEST_MAX_CHAT_MESSAGES_PER_DAY: num({ default: 1 }),
  GUEST_MAX_TOTAL: num({ default: 100 }),
});

export const config = {
  db: {
    url: env.DATABASE_URL,
  },
  auth: {
    secret: env.AUTH_SECRET,
    url: env.AUTH_URL,
    googleClientId: env.GOOGLE_CLIENT_ID,
    googleClientSecret: env.GOOGLE_CLIENT_SECRET,
    sessionMaxAgeSeconds: env.SESSION_MAX_AGE_SECONDS,
  },
  ai: {
    provider: env.AI_PROVIDER as 'openai' | 'anthropic',
    apiKey: env.AI_API_KEY,
    model: env.AI_MODEL,
    systemPromptFilePath: env.PRACTICE_PLAN_CHAT_SYSTEM_PROMPT_FILE_PATH,
  },
  server: {
    port: env.PORT,
    frontendUrl: env.FRONTEND_URL || env.AUTH_URL,
    isProduction: env.NODE_ENV === 'production',
  },
  logger: {
    level: env.LOG_LEVEL,
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
  storage: {
    endpoint: env.S3_ENDPOINT,
    accessKey: env.S3_ACCESS_KEY,
    secretKey: env.S3_SECRET_KEY,
    bucket: env.S3_BUCKET,
    region: env.S3_REGION,
  },
  guest: {
    maxRecordings: env.GUEST_MAX_RECORDINGS,
    maxChatMessagesPerDay: env.GUEST_MAX_CHAT_MESSAGES_PER_DAY,
    maxTotal: env.GUEST_MAX_TOTAL,
  },
};
