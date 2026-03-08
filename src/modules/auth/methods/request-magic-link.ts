import type { MagicLinkRequest } from '../dto.js';
import { logger } from '../../../utils/logger.js';

export async function requestMagicLink(
  input: MagicLinkRequest,
  internalApiUrl: string,
  frontendUrl: string
): Promise<{ message: string }> {
  const { email } = input;

  const csrfResponse = await fetch(`${internalApiUrl}/api/auth/csrf`);
  if (!csrfResponse.ok) {
    logger.error(
      { status: csrfResponse.status },
      'Failed to fetch CSRF token'
    );
    throw new Error('Failed to initiate magic link flow');
  }

  const { csrfToken } = (await csrfResponse.json()) as { csrfToken: string };
  const csrfCookie = csrfResponse.headers.get('set-cookie') || '';

  const signInResponse = await fetch(`${internalApiUrl}/api/auth/signin/resend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      cookie: csrfCookie,
    },
    body: new URLSearchParams({
      email,
      csrfToken,
      callbackUrl: frontendUrl,
    }),
    redirect: 'manual',
  });

  const location = signInResponse.headers.get('location') || '';
  if (location.includes('error')) {
    const errorUrl = new URL(location, internalApiUrl);
    const errorCode = errorUrl.searchParams.get('error') || 'Unknown';
    logger.error({ email, errorCode, location }, 'Auth.js magic link error');
    throw new Error(`Failed to send magic link: ${errorCode}`);
  }

  if (signInResponse.status >= 400) {
    const body = await signInResponse.text();
    logger.error(
      { email, status: signInResponse.status, body },
      'Failed to send magic link'
    );
    throw new Error('Failed to send magic link');
  }

  logger.info({ email }, 'Magic link sent');
  return { message: 'Magic link sent' };
}
