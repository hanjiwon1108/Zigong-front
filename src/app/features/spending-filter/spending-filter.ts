import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Category, CATEGORIES } from '../../shared/model/types';
import { gsap } from 'gsap';

@Component({
  selector: 'feature-spending-filter',
  standalone: true,
  template: `
    <div class="bar">
      <button class="chip" [class.on]="selected === '전체'" (click)="onSelect('전체', $event)">전체</button>
      @for (cat of cats; track cat) {
        <button class="chip" [class.on]="selected === cat" (click)="onSelect(cat, $event)">{{ cat }}</button>
      }
    </div>
  `,
  styles: [`
    .bar {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding-bottom: 14px;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
    }
    .bar::-webkit-scrollbar { display: none; }

    .chip {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      padding: 0 14px;
      height: 34px;
      border-radius: 10px;
      border: 1px solid var(--divider);
      background: var(--bg-card);
      color: var(--text-3);
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.18s cubic-bezier(0.22,1,0.36,1);
      font-family: inherit;
      letter-spacing: -0.2px;
      -webkit-tap-highlight-color: transparent;
      white-space: nowrap;
    }
    .chip:hover { background: var(--bg-card-2); color: var(--text-1); }
    .chip:active { transform: scale(0.94); }
    .chip.on {
      background: var(--blue);
      color: #fff;
      font-weight: 700;
      border-color: transparent;
      box-shadow: 0 2px 10px rgba(49,130,246,0.3);
    }
  `]
})
export class SpendingFilter {
  @Input() selected: Category | '전체' = '전체';
  @Output() select = new EventEmitter<Category | '전체'>();
  readonly cats = CATEGORIES;

  onSelect(cat: Category | '전체', event: Event) {
    const el = event.currentTarget as HTMLElement;
    gsap.fromTo(el, { scale: 0.92 }, { scale: 1, duration: 0.28, ease: 'back.out(2)' });
    this.select.emit(cat);
  }
}
