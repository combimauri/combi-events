import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  computed,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
} from '@angular/core';

const THEME_STORAGE_KEY = 'ce-theme';
const THEME_COLORS = { light: '#fbfaf9', dark: '#141416' } as const;

@Injectable({
  providedIn: 'root',
})
export class ThemeState {
  readonly darkMode = computed(() => this.#darkMode());

  readonly #darkMode = signal(false);
  readonly #document = inject(DOCUMENT);
  readonly #isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    if (this.#isBrowser) {
      // The initial theme class is set by the inline script in index.html to
      // avoid a flash of the wrong theme; here we only sync the signal.
      this.#darkMode.set(
        this.#document.documentElement.classList.contains('dark'),
      );
    }
  }

  toggleDarkMode(): void {
    const darkMode = !this.#darkMode();

    this.#darkMode.set(darkMode);
    this.#applyTheme(darkMode);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, darkMode ? 'dark' : 'light');
    } catch {
      // Storage can be unavailable (private browsing); the theme still applies.
    }
  }

  #applyTheme(darkMode: boolean): void {
    this.#document.documentElement.classList.toggle('dark', darkMode);
    this.#document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        'content',
        darkMode ? THEME_COLORS.dark : THEME_COLORS.light,
      );
  }
}
