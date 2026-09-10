import { User } from '../types';

export const userService = {
  /**
   * Update authenticated user profile on backend
   */
  async updateProfile(updatedData: Partial<User>): Promise<User> {
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updatedData)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update user profile.');
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
