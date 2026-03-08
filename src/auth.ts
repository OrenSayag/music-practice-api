import { DrizzleAdapter } from '@auth/drizzle-adapter';
import Resend from '@auth/core/providers/resend';
import type { AuthConfig } from '@hono/auth-js';
import { db } from './db/index.js';
import { config } from './config.js';
import * as schema from './db/schema.js';
import { logger } from './utils/logger.js';
import { loginEmailHtml, loginEmailText } from './utils/email-template.js';

export function getAuthConfig(): AuthConfig {
  return {
    adapter: DrizzleAdapter(db, {
      usersTable: schema.users,
      accountsTable: schema.accounts,
      sessionsTable: schema.sessions,
      verificationTokensTable: schema.verificationTokens,
    }),
    providers: [
      Resend({
        from: config.auth.emailFrom,
        async sendVerificationRequest({ identifier: to, url, provider }) {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${provider.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: provider.from,
              to,
              subject: 'Sign in to your account',
              html: loginEmailHtml(url),
              text: loginEmailText(url),
            }),
          });
          if (!res.ok) {
            throw new Error('Resend error: ' + JSON.stringify(await res.json()));
          }
        },
      }),
    ],
    basePath: '/api/auth',
    session: { strategy: 'database', maxAge: config.auth.sessionMaxAgeSeconds },
    pages: {
      signIn: `${config.server.frontendUrl}/auth/login`,
      verifyRequest: `${config.server.frontendUrl}/auth/check-email`,
    },
    callbacks: {
      async signIn() {
        return true;
      },
      session({ session, user }) {
        if (user?.id) {
          session.user.id = user.id;
        }
        return session;
      },
    },
  };
}
