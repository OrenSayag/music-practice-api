import 'dotenv/config';
import { cleanEnv, str, num } from 'envalid';

const env = cleanEnv(process.env, {
  DATABASE_URL: str(),
  AUTH_SECRET: str(),
  AUTH_URL: str(),
  AUTH_RESEND_KEY: str(),
  EMAIL_FROM: str(),
  AI_PROVIDER: str({ choices: ['openai', 'anthropic'] }),
  AI_API_KEY: str(),
  AI_MODEL: str(),
  PRACTICE_PLAN_CHAT_SYSTEM_PROMPT_FILE_PATH: str(),
  FRONTEND_URL: str(),
  PORT: num(),
  NODE_ENV: str({ default: 'development' }),
  LOG_LEVEL: str({ default: 'info' }),
  RATE_LIMIT_WINDOW_MS: num({ default: 900000 }),
  RATE_LIMIT_MAX_REQUESTS: num({ default: 100 }),
  MAGIC_LINK_RATE_LIMIT_WINDOW_MS: num({ default: 900000 }),
  MAGIC_LINK_RATE_LIMIT_MAX_REQUESTS: num({ default: 5 }),
  SESSION_MAX_AGE_SECONDS: num({ default: 30 * 24 * 60 * 60 }),
  S3_ENDPOINT: str({ default: 'http://localhost:9000' }),
  S3_ACCESS_KEY: str({ default: 'minioadmin' }),
  S3_SECRET_KEY: str({ default: 'minioadmin' }),
  S3_BUCKET: str({ default: 'recordings' }),
  S3_REGION: str({ default: 'us-east-1' }),
});

export const config = {
  db: {
    url: env.DATABASE_URL,
  },
  auth: {
    secret: env.AUTH_SECRET,
    url: env.AUTH_URL,
    resendKey: env.AUTH_RESEND_KEY,
    emailFrom: env.EMAIL_FROM,
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
    frontendUrl: env.FRONTEND_URL,
    isProduction: env.NODE_ENV === 'production',
  },
  logger: {
    level: env.LOG_LEVEL,
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
  magicLinkRateLimit: {
    windowMs: env.MAGIC_LINK_RATE_LIMIT_WINDOW_MS,
    maxRequests: env.MAGIC_LINK_RATE_LIMIT_MAX_REQUESTS,
  },
  storage: {
    endpoint: env.S3_ENDPOINT,
    accessKey: env.S3_ACCESS_KEY,
    secretKey: env.S3_SECRET_KEY,
    bucket: env.S3_BUCKET,
    region: env.S3_REGION,
  },
};
