import { TimeCalculation } from '@types/index';

export class TimeCalculator {
  /**
   * Calculate time lived and remaining based on birth date and target lifetime
   */
  static calculateTime(
    birthDate: Date,
    targetLifetimeYears: number,
    currentTime: Date = new Date()
  ): TimeCalculation {
    const birthTimestamp = birthDate.getTime();
    const currentTimestamp = currentTime.getTime();
    const targetTimestamp = new Date(
      birthDate.getFullYear() + targetLifetimeYears,
      birthDate.getMonth(),
      birthDate.getDate()
    ).getTime();

    const livedMs = currentTimestamp - birthTimestamp;
    const remainingMs = targetTimestamp - currentTimestamp;

    const timeLived = this.breakdownTime(livedMs);
    const timeRemaining = this.breakdownTime(Math.max(0, remainingMs));

    const totalTargetMs = targetTimestamp - birthTimestamp;
    const lifeProgressPercentage = (livedMs / totalTargetMs) * 100;

    return {
      timeLived,
      timeRemaining,
      lifeProgressPercentage: Math.min(100, Math.max(0, lifeProgressPercentage)),
      timestamp: currentTime,
    };
  }

  /**
   * Break down milliseconds into years, months, days, hours, minutes, seconds
   */
  private static breakdownTime(milliseconds: number) {
    let remaining = Math.floor(milliseconds / 1000); // Convert to seconds

    const seconds = remaining % 60;
    remaining = Math.floor(remaining / 60);

    const minutes = remaining % 60;
    remaining = Math.floor(remaining / 60);

    const hours = remaining % 24;
    remaining = Math.floor(remaining / 24);

    const days = remaining % 365;
    const years = Math.floor(remaining / 365);

    // Calculate months more accurately
    const months = Math.floor((days % 365) / 30.44);
    const daysRemainder = Math.floor((days % 365) % 30.44);

    return {
      years,
      months,
      days: daysRemainder,
      hours,
      minutes,
      seconds,
      totalSeconds: Math.floor(milliseconds / 1000),
    };
  }

  /**
   * Format time lived/remaining for display
   */
  static formatTimeDisplay(
    years: number,
    months: number,
    days: number,
    format: 'short' | 'full' = 'full'
  ): string {
    if (format === 'short') {
      return `${years}Y ${months}M ${days}D`;
    }

    const parts = [];
    if (years > 0) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
    if (months > 0) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
    if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);

    return parts.join(', ') || '0 days';
  }

  /**
   * Format time in various units for the detailed view
   */
  static formatDetailedTime(totalSeconds: number): {
    years: number;
    months: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } {
    let remaining = totalSeconds;

    const seconds = remaining % 60;
    remaining = Math.floor(remaining / 60);

    const minutes = remaining % 60;
    remaining = Math.floor(remaining / 60);

    const hours = remaining % 24;
    remaining = Math.floor(remaining / 24);

    const days = remaining % 365;
    const years = Math.floor(remaining / 365);

    const months = Math.floor((days % 365) / 30.44);
    const daysRemainder = Math.floor((days % 365) % 30.44);

    return {
      years,
      months,
      days: daysRemainder,
      hours,
      minutes,
      seconds,
    };
  }

  /**
   * Format large numbers with commas for display
   */
  static formatLargeNumber(num: number): string {
    return num.toLocaleString('en-US');
  }

  /**
   * Get age in years (integer)
   */
  static getAgeInYears(birthDate: Date, currentTime: Date = new Date()): number {
    let age = currentTime.getFullYear() - birthDate.getFullYear();
    const monthDiff = currentTime.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && currentTime.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  /**
   * Get date of death based on target lifetime
   */
  static getProjectedDeathDate(
    birthDate: Date,
    targetLifetimeYears: number
  ): Date {
    return new Date(
      birthDate.getFullYear() + targetLifetimeYears,
      birthDate.getMonth(),
      birthDate.getDate()
    );
  }

  /**
   * Check if life target has been exceeded
   */
  static isLifeTargetExceeded(
    birthDate: Date,
    targetLifetimeYears: number,
    currentTime: Date = new Date()
  ): boolean {
    const projectedDeath = this.getProjectedDeathDate(birthDate, targetLifetimeYears);
    return currentTime > projectedDeath;
  }

  /**
   * Calculate percentage of life lived
   */
  static getLifePercentage(
    birthDate: Date,
    targetLifetimeYears: number,
    currentTime: Date = new Date()
  ): number {
    const calculation = this.calculateTime(birthDate, targetLifetimeYears, currentTime);
    return calculation.lifeProgressPercentage;
  }

  /**
   * Validate birth date (should not be in future)
   */
  static isValidBirthDate(birthDate: Date): boolean {
    return birthDate <= new Date();
  }

  /**
   * Validate target lifetime (should be positive and reasonable)
   */
  static isValidTargetLifetime(targetLifetime: number): boolean {
    return targetLifetime > 0 && targetLifetime <= 150;
  }
}
