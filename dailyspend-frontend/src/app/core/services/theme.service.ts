import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private activeThemeSubject = new BehaviorSubject<'light' | 'dark' | 'system'>('system');
  activeTheme$ = this.activeThemeSubject.asObservable();

  constructor() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const theme = (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
      this.activeThemeSubject.next(theme);
      this.applyTheme(theme);

      // Listen for system preference changes if theme is system
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.activeThemeSubject.value === 'system') {
          this.applyTheme('system');
        }
      });
    }
  }

  setTheme(theme: 'light' | 'dark' | 'system'): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', theme);
      this.activeThemeSubject.next(theme);
      this.applyTheme(theme);
    }
  }

  toggleTheme(): void {
    const current = this.activeThemeSubject.value;
    let next: 'light' | 'dark' | 'system' = 'light';
    if (current === 'light') {
      next = 'dark';
    } else if (current === 'dark') {
      next = 'system';
    } else {
      next = 'light';
    }
    this.setTheme(next);
  }

  toggleLightDark(): void {
    const current = this.activeThemeSubject.value;
    let next: 'light' | 'dark';
    if (current === 'light') {
      next = 'dark';
    } else if (current === 'dark') {
      next = 'light';
    } else {
      // Current is 'system'. Check actual system preference.
      const isSystemDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
      next = isSystemDark ? 'light' : 'dark';
    }
    this.setTheme(next);
  }

  private applyTheme(theme: 'light' | 'dark' | 'system'): void {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('light-theme', 'dark-theme');
      if (theme === 'dark') {
        root.classList.add('dark-theme');
      } else if (theme === 'light') {
        root.classList.add('light-theme');
      } else {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.add(isDark ? 'dark-theme' : 'light-theme');
      }
    }
  }

  getCurrentTheme(): 'light' | 'dark' | 'system' {
    return this.activeThemeSubject.value;
  }
}
