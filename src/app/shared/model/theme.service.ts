import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly KEY = 'toss-theme';

  readonly theme = signal<Theme>(this.load());

  constructor() {
    effect(() => this.apply(this.theme()));
  }

  toggle() {
    this.theme.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  private load(): Theme {
    const saved = localStorage.getItem(this.KEY) as Theme | null;
    if (saved) return saved;
    return 'dark';
  }

  private apply(t: Theme) {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem(this.KEY, t);
  }
}
