import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../shared/model/theme.service';
import { gsap } from 'gsap';

type NavIcon = 'dashboard' | 'analytics' | 'transactions' | 'simulator' | 'settings';
interface NavItemConfig {
  path: string;
  label: string;
  icon: NavIcon;
}

@Component({
  selector: 'widget-bottom-nav',
  standalone: true,
  imports: [RouterModule],
  template: `
    <nav class="bar">
      @for (item of items; track item.path) {
        <a
          class="item"
          [class.active]="rla.isActive"
          [routerLink]="item.path"
          routerLinkActive
          #rla="routerLinkActive"
          (click)="onTabClick($event)"
        >
          <span class="icon" [class.active]="rla.isActive" aria-hidden="true">
            @switch (item.icon) {
              @case ('dashboard') {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              }
              @case ('analytics') {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              }
              @case ('transactions') {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
              }
              @case ('simulator') {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                  <polyline points="16 7 22 7 22 13"/>
                </svg>
              }
              @case ('settings') {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                </svg>
              }
            }
          </span>
          <span class="label" [class.active]="rla.isActive">{{ item.label }}</span>
        </a>
      }
      <button class="item theme-item" (click)="toggleTheme()">
        <span class="icon" aria-hidden="true">
          @if (theme.theme() === 'dark') {
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          } @else {
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          }
        </span>
        <span class="label">{{ theme.theme() === 'dark' ? '라이트' : '다크' }}</span>
      </button>
    </nav>
  `,
  styles: [`
    .bar {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      display: flex;
      align-items: stretch;
      gap: 2px;
      background: rgba(10,10,18,0.88);
      backdrop-filter: blur(32px) saturate(200%);
      -webkit-backdrop-filter: blur(32px) saturate(200%);
      border-top: 1px solid rgba(255,255,255,0.07);
      padding: 6px 8px calc(env(safe-area-inset-bottom) + 6px);
      z-index: 200;
      box-shadow: 0 -1px 0 rgba(255,255,255,0.05), 0 -8px 32px rgba(0,0,0,0.4);
      transition: background 0.22s, border-color 0.22s;
    }
    :root[data-theme="light"] .bar {
      background: rgba(242,244,246,0.92);
      border-top-color: rgba(0,0,0,0.06);
      box-shadow: 0 -8px 32px rgba(0,0,0,0.08);
    }
    .item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 8px 4px 7px;
      gap: 4px;
      text-decoration: none;
      background: none;
      border: none;
      border-radius: 14px;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition: background 0.18s;
      min-width: 0;
      min-height: 58px;
    }
    .item.active { background: rgba(74,144,255,0.1); }
    :root[data-theme="light"] .item.active { background: var(--blue-bg); }
    .item:active { opacity: 0.65; }

    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 26px; height: 26px;
      color: var(--text-3);
      transition: color 0.15s, transform 0.2s cubic-bezier(0.22,1,0.36,1);
      flex-shrink: 0;
    }
    .icon svg { width: 22px; height: 22px; }
    .icon.active {
      color: #7AB3FF;
      transform: translateY(-1px);
    }
    :root[data-theme="light"] .icon.active { color: var(--blue); }

    .label {
      font-size: 0.65rem;
      font-weight: 600;
      color: var(--text-3);
      font-family: 'Pretendard', -apple-system, sans-serif;
      transition: color 0.15s;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
      letter-spacing: -0.2px;
    }
    .label.active { color: #7AB3FF; font-weight: 700; }
    :root[data-theme="light"] .label.active { color: var(--blue); }

    .theme-item {
      background: transparent;
      border: 1px solid var(--divider) !important;
      border-radius: 14px;
      background: var(--bg-card-2) !important;
    }

    @media (max-width: 360px) {
      .bar { gap: 1px; padding-left: 4px; padding-right: 4px; }
      .item { min-height: 54px; }
      .label { font-size: 0.6rem; }
      .icon svg { width: 20px; height: 20px; }
    }
  `],
})
export class BottomNav {
  readonly theme = inject(ThemeService);

  readonly items: NavItemConfig[] = [
    { path: '/dashboard',    label: '홈',   icon: 'dashboard'    },
    { path: '/analytics',    label: '분석', icon: 'analytics'    },
    { path: '/transactions', label: '내역', icon: 'transactions' },
    { path: '/simulator',    label: '시뮬', icon: 'simulator'    },
    { path: '/settings',     label: '설정', icon: 'settings'     },
  ];

  onTabClick(event: Event) {
    const el = event.currentTarget as HTMLElement;
    gsap.fromTo(el, { scale: 0.9 }, { scale: 1, duration: 0.3, ease: 'back.out(2.5)' });
  }

  toggleTheme() {
    this.theme.toggle();
    const el = document.querySelector('.theme-item') as HTMLElement;
    if (el) {
      gsap.fromTo(el, { rotation: -25, scale: 0.8 }, { rotation: 0, scale: 1, duration: 0.4, ease: 'back.out(2)' });
    }
  }
}
