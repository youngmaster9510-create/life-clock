import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, ThemeType, TimeCalculation } from '@types/index';
import { StorageManager } from '@utils/storage';
import { TimeCalculator } from '@utils/timeCalculator';

interface AppState {
  // Profile
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;

  // Theme
  currentTheme: ThemeType;
  setTheme: (theme: ThemeType) => void;

  // Time calculations
  timeCalculation: TimeCalculation | null;
  updateTimeCalculation: () => void;

  // UI State
  isOnboarding: boolean;
  setIsOnboarding: (value: boolean) => void;
  currentStep: string;
  setCurrentStep: (step: string) => void;

  // Preferences
  focusMode: boolean;
  setFocusMode: (value: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (value: boolean) => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  fontSize: 'small' | 'normal' | 'large';
  setFontSize: (size: 'small' | 'normal' | 'large') => void;

  // Utilities
  initialize: () => void;
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: null,
      currentTheme: 'golden-sunset',
      timeCalculation: null,
      isOnboarding: true,
      currentStep: 'welcome',
      focusMode: false,
      reducedMotion: false,
      highContrast: false,
      fontSize: 'normal',

      setProfile: (profile) => {
        set({ profile });
        StorageManager.saveProfile(profile);
      },

      updateProfile: (updates) => {
        const current = get().profile;
        if (current) {
          const updated = { ...current, ...updates, updatedAt: new Date() };
          set({ profile: updated });
          StorageManager.saveProfile(updated);
        }
      },

      setTheme: (theme) => {
        set({ currentTheme: theme });
        const profile = get().profile;
        if (profile) {
          get().updateProfile({ theme });
        }
      },

      updateTimeCalculation: () => {
        const profile = get().profile;
        if (profile) {
          const calculation = TimeCalculator.calculateTime(
            profile.dateOfBirth,
            profile.targetLifetime
          );
          set({ timeCalculation: calculation });
        }
      },

      setIsOnboarding: (value) => set({ isOnboarding: value }),
      setCurrentStep: (step) => set({ currentStep: step }),
      setFocusMode: (value) => set({ focusMode: value }),
      setReducedMotion: (value) => set({ reducedMotion: value }),
      setHighContrast: (value) => set({ highContrast: value }),
      setFontSize: (size) => set({ fontSize: size }),

      initialize: () => {
        const savedProfile = StorageManager.getProfile();
        const savedPreferences = StorageManager.getPreferences();

        if (savedProfile) {
          set({
            profile: savedProfile,
            isOnboarding: false,
            currentTheme: savedProfile.theme,
          });

          // Recalculate time on app load
          const calculation = TimeCalculator.calculateTime(
            savedProfile.dateOfBirth,
            savedProfile.targetLifetime
          );
          set({ timeCalculation: calculation });
        }

        if (savedPreferences) {
          set({
            focusMode: savedPreferences.focusMode,
            reducedMotion: savedPreferences.reducedMotion,
            highContrast: savedPreferences.highContrast,
            fontSize: savedPreferences.fontSize,
          });
        }
      },

      reset: () => {
        StorageManager.clearAll();
        set({
          profile: null,
          currentTheme: 'golden-sunset',
          timeCalculation: null,
          isOnboarding: true,
          currentStep: 'welcome',
          focusMode: false,
          reducedMotion: false,
          highContrast: false,
          fontSize: 'normal',
        });
      },
    }),
    {
      name: 'life-clock-store',
      partialize: (state) => ({
        focusMode: state.focusMode,
        reducedMotion: state.reducedMotion,
        highContrast: state.highContrast,
        fontSize: state.fontSize,
      }),
    }
  )
);
