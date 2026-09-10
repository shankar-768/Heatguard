import { User, UserCategory } from '../types';

async function parseJsonResponse(res: Response) {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch {
      // json parse failed
    }
  }
  if (!res.ok) {
    throw new Error(`Unable to connect to backend server (HTTP ${res.status}). Please make sure the Express server is running on http://localhost:5000.`);
  }
  throw new Error('Received unexpected non-JSON response from server.');
}

export const authService = {
  /**
   * Fetch currently authenticated user from Express backend session cookie
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const res = await fetch('/api/auth/me', {
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
   * Authenticate user against backend database with email & password hash verification
   */
  async login(email: string, pass: string): Promise<User> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password: pass })
    });

    const data = await parseJsonResponse(res);
    if (!res.ok) {
      throw new Error(data.error || 'Invalid email or password.');
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
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });

    const result = await parseJsonResponse(res);
    if (!res.ok) {
      throw new Error(result.error || 'Registration failed. Please check your details.');
    }

    return result.user;
  },

  /**
   * Invalidate server session & clear HTTP-Only cookie
   */
  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch {
      // ignore network errors during logout
    }
  },

  /**
   * Mark user onboarding status as complete in server database
   */
  async setOnboardingComplete(): Promise<User | null> {
    try {
      const res = await fetch('/api/user/onboarding', {
        method: 'PUT',
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
    const res = await fetch('/api/auth/forgot-password', {
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
    const res = await fetch('/api/auth/reset-password', {
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
