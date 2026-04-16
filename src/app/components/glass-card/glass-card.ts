import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-glass-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-panel" [ngStyle]="{'padding': padding}">
      <h3 *ngIf="title" class="card-title">{{ title }}</h3>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .card-title {
      margin-top: 0;
      margin-bottom: 1.5rem;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
    }
  `]
})
export class GlassCard {
  @Input() title: string = '';
  @Input() padding: string = '24px';
}
