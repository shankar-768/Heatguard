import { User, UserCategory } from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const TOKEN_KEY = 'heatguard_session_token';

function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders
  };
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function parseJsonResponse(res: Response) {
  const contentType = res.headers.get('content-type') || '';
  let data: any = null;

  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch (parseErr) {
      console.warn('[authService] Failed to parse JSON response:', parseErr);
    }
  } else {
    try {
      const textPreview = await res.text();
      console.warn(`[authService] Non-JSON response received (HTTP ${res.status}):`, textPreview.slice(0, 300));
    } catch {
      // ignore
    }
  }

  if (res.ok && data !== null) {
    return data;
  }

  if (data && data.error) {
    throw new Error(data.error);
  }

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Invalid email or password.');
    }
    if (res.status === 429) {
      throw new Error('Too many attempts. Please wait a few minutes and try again.');
    }
    throw new Error(`Authentication server error (HTTP ${res.status}). Please check server connection.`);
  }

  throw new Error('Received unexpected response from server.');
}

export const authService = {
  /**
   * Fetch currently authenticated user from Express backend session cookie or token
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers,
        credentials: 'include'
      });
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
        }
        return null;
      }
      const data = await parseJsonResponse(res);
      return data.user || null;
    } catch {
      return null;
    }
  },

  /**
   * Authenticate user against backend database with email & password hash verification
   */
  async login(email: string, pass: string): Promise<User> {
    const headers = getAuthHeaders();
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ email, password: pass })
    });

    const data = await parseJsonResponse(res);
    if (!res.ok) {
      throw new Error(data.error || 'Invalid email or password.');
    }

    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
    }

    return data.user;
  },

  /**
   * Register new user account with password hashing on backend
   */
  async signup(data: {
    name: string;
    email: string;
    phone: string;
    location: string;
    userCategory: UserCategory;
    password?: string;
    confirmPassword?: string;
  }): Promise<User> {
    const headers = getAuthHeaders();
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(data)
    });

    const result = await parseJsonResponse(res);
    if (!res.ok) {
      throw new Error(result.error || 'Registration failed. Please check your details.');
    }

    if (result.token) {
      localStorage.setItem(TOKEN_KEY, result.token);
    }

    return result.user;
  },

  /**
   * Invalidate server session & clear HTTP-Only cookie and local token
   */
  async logout(): Promise<void> {
    try {
      const headers = getAuthHeaders();
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers,
        credentials: 'include'
      });
    } catch {
      // ignore network errors during logout
    } finally {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  /**
   * Mark user onboarding status as complete in server database
   */
  async setOnboardingComplete(): Promise<User | null> {
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE}/user/onboarding`, {
        method: 'PUT',
        headers,
        credentials: 'include'
      });
      if (!res.ok) return null;
      const data = await parseJsonResponse(res);
      return data.user || null;
    } catch {
      return null;
    }
  },

  /**
   * Request password reset token
   */
  async requestPasswordReset(email: string): Promise<{ message: string; resetToken?: string }> {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await parseJsonResponse(res);
    if (!res.ok) {
      throw new Error(data.error || 'Failed to request password reset.');
    }

    return data;
  },

  /**
   * Reset password with valid token
   */
  async resetPassword(data: { token: string; newPassword?: string; confirmPassword?: string }): Promise<void> {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await parseJsonResponse(res);
    if (!res.ok) {
      throw new Error(result.error || 'Failed to reset password.');
    }
  }
};
