import { User } from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const TOKEN_KEY = 'heatguard_session_token';

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const userService = {
  /**
   * Update authenticated user profile on backend
   */
  async updateProfile(updatedData: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE}/user/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(updatedData)
    });

    let data: any = null;
    try {
      data = await res.json();
    } catch {
      // ignore JSON parse error
    }

    if (!res.ok) {
      const errMsg = data?.error || `Failed to update user profile (HTTP ${res.status})`;
      console.error('[userService] Profile update error:', errMsg);
      throw new Error(errMsg);
    }

    return data.user;
  },

  async updateNotificationPreferences(
    prefs: User['notificationPreferences']
  ): Promise<User> {
    return this.updateProfile({ notificationPreferences: prefs });
  },

  async addEmergencyContact(
    contact: { name: string; phone: string; relation: string },
    currentContacts: User['emergencyContacts'] = []
  ): Promise<User> {
    const updatedContacts = [...currentContacts, contact];
    return this.updateProfile({ emergencyContacts: updatedContacts });
  },

  async removeEmergencyContact(
    index: number,
    currentContacts: User['emergencyContacts'] = []
  ): Promise<User> {
    const existing = [...currentContacts];
    existing.splice(index, 1);
    return this.updateProfile({ emergencyContacts: existing });
  }
};
