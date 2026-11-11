import * as SecureStore from 'expo-secure-store';

/**
 * LargeSecureStore adapter compatible with Supabase auth storage.
 * Handles SecureStore values securely.
 */
export class SecureSessionStorage {
  private sanitizeKey(key: string): string {
    return key.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.sanitizeKey(key));
    } catch (e) {
      console.warn('SecureStore getItem error:', e);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.sanitizeKey(key), value);
    } catch (e) {
      console.warn('SecureStore setItem error:', e);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.sanitizeKey(key));
    } catch (e) {
      console.warn('SecureStore removeItem error:', e);
    }
  }
}

export const secureSessionStorage = new SecureSessionStorage();

