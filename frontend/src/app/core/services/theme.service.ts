import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'patients-theme';
  private readonly darkThemeLinkId = 'primeng-dark-theme';
  private readonly darkThemeHref = 'assets/themes/lara-dark-blue.css';

  private readonly isDarkSubject = new BehaviorSubject<boolean>(false);

  isDark$ = this.isDarkSubject.asObservable();

  constructor() {
    const stored = localStorage.getItem(this.storageKey);
    this.apply(stored === 'dark');
  }

  toggle(): void {
    this.apply(!this.isDarkSubject.value);
  }

  private apply(isDark: boolean): void {
    this.isDarkSubject.next(isDark);
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem(this.storageKey, isDark ? 'dark' : 'light');
    this.syncThemeLink(isDark);
  }

  private syncThemeLink(isDark: boolean): void {
    const existing = document.getElementById(this.darkThemeLinkId) as HTMLLinkElement | null;
    if (isDark && !existing) {
      const link = document.createElement('link');
      link.id = this.darkThemeLinkId;
      link.rel = 'stylesheet';
      link.href = this.darkThemeHref;
      document.head.appendChild(link);
    } else if (!isDark && existing) {
      existing.remove();
    }
  }
}
