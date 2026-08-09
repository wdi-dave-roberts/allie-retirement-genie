/**
 * Profile — Allie's real numbers. localStorage only; never leaves the device.
 */

export interface Profile {
  salary: number;
  monthlySpend: number;
  currentSavings: number;
  matchPercent: number;
}

const KEY = "genie.profile.v1";

export const DEFAULT_PROFILE: Profile = {
  salary: 0,
  monthlySpend: 0,
  currentSavings: 0,
  matchPercent: 6,
};

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    const parsed = JSON.parse(raw) as Partial<Profile>;
    return { ...DEFAULT_PROFILE, ...parsed };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export function saveProfile(profile: Profile): void {
  localStorage.setItem(KEY, JSON.stringify(profile));
}

export function clearProfile(): void {
  localStorage.removeItem(KEY);
}
