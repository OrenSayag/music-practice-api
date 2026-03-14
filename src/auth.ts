import { DrizzleAdapter } from '@auth/drizzle-adapter';
import Google from '@auth/core/providers/google';
import type { AuthConfig } from '@hono/auth-js';
import { db } from './db/index.js';
import { config } from './config.js';
import * as schema from './db/schema.js';

export function getAuthConfig(): AuthConfig {
  return {
    adapter: DrizzleAdapter(db, {
      usersTable: schema.users,
      accountsTable: schema.accounts,
      sessionsTable: schema.sessions,
      verificationTokensTable: schema.verificationTokens,
    }),
    providers: [
      Google({
        clientId: config.auth.googleClientId,
        clientSecret: config.auth.googleClientSecret,
        allowDangerousEmailAccountLinking: true,
      }),
    ],
    basePath: '/api/auth',
    session: { strategy: 'database', maxAge: config.auth.sessionMaxAgeSeconds },
    pages: {
      signIn: '/auth/login',
    },
    callbacks: {
      async signIn() {
        return true;
      },
      async redirect() {
        return `${config.server.frontendUrl}/home`;
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
