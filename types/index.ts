export type ThemeType = 
  | 'golden-sunset'
  | 'ocean'
  | 'forest'
  | 'mountain-morning'
  | 'night-sky'
  | 'rain'
  | 'spring'
  | 'autumn'
  | 'winter'
  | 'zen'
  | 'custom';

export type LifetimeTarget = 70 | 75 | 80 | 85 | 90 | 100 | number;

export type Country = {
  code: string;
  name: string;
  flag: string;
  timezone: string;
  locale: string;
  dateFormat: string;
};

export type ColorPalette = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  glassLight: string;
  glassDark: string;
  highlight: string;
  shadow: string;
};

export type ThemeConfig = {
  id: ThemeType;
  name: string;
  description: string;
  backgroundImage?: string;
  colorPalette: ColorPalette;
  hasAnimation: boolean;
  animationType?: 'waves' | 'leaves' | 'rain' | 'stars' | 'clouds' | 'glow';
  mood: 'warm' | 'cool' | 'neutral' | 'energetic' | 'calm';
};

export type UserProfile = {
  id: string;
  username: string;
  country: Country;
  dateOfBirth: Date;
  birthTime?: string;
  timezone: string;
  targetLifetime: LifetimeTarget;
  theme: ThemeType;
  customWallpaperPath?: string;
  motivationalMessage: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TimeCalculation = {
  timeLived: {
    years: number;
    months: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  };
  timeRemaining: {
    years: number;
    months: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  };
  lifeProgressPercentage: number;
  timestamp: Date;
};

export type ExtractedColors = {
  dominant: string;
  secondary: string;
  accent: string;
  brightness: 'light' | 'dark' | 'medium';
  tone: 'warm' | 'cool' | 'neutral';
  saturation: 'high' | 'medium' | 'low';
  mood: 'energetic' | 'calm' | 'passionate' | 'peaceful';
};

export type StorageData = {
  profile: UserProfile;
  customTheme?: ThemeConfig;
  preferences: {
    focusMode: boolean;
    reducedMotion: boolean;
    highContrast: boolean;
    fontSize: 'small' | 'normal' | 'large';
  };
};

export type OnboardingStep = 
  | 'welcome'
  | 'name'
  | 'country'
  | 'date-of-birth'
  | 'lifetime-target'
  | 'theme-selection'
  | 'custom-photo'
  | 'complete';
