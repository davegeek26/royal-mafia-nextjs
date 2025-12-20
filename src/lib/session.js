import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get session ID from cookies
 * @returns {Promise<string|null>} The session ID or null if not found
 */
export async function getSessionId() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_id');
  return sessionCookie?.value || null;
}

/**
 * Generate a new session ID
 * @returns {string} A new UUID session ID
 */
export function generateSessionId() {
  return uuidv4();
}

/**
 * Get cookie options for session ID
 * @returns {Object} Cookie options
 */
export function getSessionCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  };
}

