import { StorageData, UserProfile } from '@types/index';

const STORAGE_KEY = 'life-clock-data';
const PROFILE_KEY = 'life-clock-profile';
const THEME_KEY = 'life-clock-theme';
const PREFERENCES_KEY = 'life-clock-preferences';

export class StorageManager {
  static isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  static saveProfile(profile: UserProfile): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  }

  static getProfile(): UserProfile | null {
    if (!this.isAvailable()) return null;
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get profile:', error);
      return null;
    }
  }

  static savePreferences(preferences: StorageData['preferences']): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  static getPreferences(): StorageData['preferences'] | null {
    if (!this.isAvailable()) return null;
    try {
      const data = localStorage.getItem(PREFERENCES_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get preferences:', error);
      return null;
    }
  }

  static saveCustomWallpaper(imageData: string): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.setItem('custom-wallpaper', imageData);
    } catch (error) {
      console.error('Failed to save wallpaper:', error);
    }
  }

  static getCustomWallpaper(): string | null {
    if (!this.isAvailable()) return null;
    try {
      return localStorage.getItem('custom-wallpaper');
    } catch (error) {
      console.error('Failed to get wallpaper:', error);
      return null;
    }
  }

  static clearAll(): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.removeItem(PROFILE_KEY);
      localStorage.removeItem(PREFERENCES_KEY);
      localStorage.removeItem('custom-wallpaper');
      localStorage.removeItem(THEME_KEY);
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }

  static exportData(): StorageData | null {
    const profile = this.getProfile();
    const preferences = this.getPreferences();

    if (!profile) return null;

    return {
      profile,
      preferences: preferences || {
        focusMode: false,
        reducedMotion: false,
        highContrast: false,
        fontSize: 'normal',
      },
    };
  }

  static importData(data: StorageData): boolean {
    try {
      this.saveProfile(data.profile);
      if (data.preferences) {
        this.savePreferences(data.preferences);
      }
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
}
