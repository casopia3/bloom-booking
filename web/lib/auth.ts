// [DECISION] Using localStorage for token storage — simplest approach for
// Phase 1. A more robust setup (httpOnly cookies + server-side session)
// is worth considering before production, since localStorage tokens are
// readable by any script on the page (XSS risk). Flagging rather than
// silently picking the more complex option without discussion.

const ACCESS_TOKEN_KEY = 'bloom_access_token';
const REFRESH_TOKEN_KEY = 'bloom_refresh_token';

export type UserRole = 'CUSTOMER' | 'SPECIALIST' | 'PROVIDER_ADMIN' | 'SUPER_ADMIN';

export const auth = {
  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },

  // Decodes the `role` claim already present in the JWT payload — the
  // backend's @CurrentUser() decorator returns { userId, role } from this
  // same token, so the claim is confirmed to exist. No new backend
  // endpoint needed just to answer "what role is this user".
  getRole(): UserRole | null {
    const token = this.getAccessToken();
    if (!token) return null;
    try {
      const payloadBase64 = token.split('.')[1];
      const payload = JSON.parse(atob(payloadBase64));
      return (payload.role as UserRole) ?? null;
    } catch {
      return null;
    }
  },
};