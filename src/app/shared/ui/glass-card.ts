import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-glass-card',
  standalone: true,
  template: `
    <div class="card" [style.padding]="padding">
      @if (title) { <p class="card-title">{{ title }}</p> }
      <ng-content />
    </div>
  `,
  styles: [`
    .card {
      background: var(--bg-card);
      border-radius: 16px;
      padding: 20px;
    }
    .card-title {
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--text-3);
      letter-spacing: -0.1px;
      margin-bottom: 0.625rem;
    }
  `]
})
export class GlassCard {
  @Input() title = '';
  @Input() padding = '20px';
}
