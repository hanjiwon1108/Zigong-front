import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Category, CATEGORIES } from '../../shared/model/types';

@Component({
  selector: 'feature-spending-filter',
  standalone: true,
  template: `
    <div class="bar">
      <button class="chip" [class.on]="selected === '전체'" (click)="select.emit('전체')">전체</button>
      @for (cat of cats; track cat) {
        <button class="chip" [class.on]="selected === cat" (click)="select.emit(cat)">{{ cat }}</button>
      }
    </div>
  `,
  styles: [`
    .bar {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding-bottom: 12px;
      scrollbar-width: none;
    }
    .bar::-webkit-scrollbar { display: none; }

    .chip {
      flex-shrink: 0;
      padding: 0 14px;
      height: 34px;
      border-radius: 20px;
      border: none;
      background: var(--bg-card-2);
      color: var(--text-3);
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s, color 0.15s, transform 0.1s;
      font-family: inherit;
      letter-spacing: -0.2px;
      -webkit-tap-highlight-color: transparent;
      min-height: 34px;
      display: inline-flex;
      align-items: center;
    }
    .chip:active { transform: scale(0.96); }
    .chip.on {
      background: #3182f6;
      color: #fff;
      font-weight: 700;
    }
  `]
})
export class SpendingFilter {
  @Input() selected: Category | '전체' = '전체';
  @Output() select = new EventEmitter<Category | '전체'>();
  readonly cats = CATEGORIES;
}
