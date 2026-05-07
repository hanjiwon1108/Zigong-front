import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'feature-saving-toggle',
  standalone: true,
  template: `
    <div class="row">
      <span class="lbl">월 30만원 절약 모드</span>
      <label class="switch">
        <input type="checkbox" [checked]="active" (change)="toggle.emit(!active)">
        <span class="track" [class.on]="active">
          <span class="thumb"></span>
        </span>
      </label>
    </div>
  `,
  styles: [`
    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 0;
      min-height: 56px;
    }
    .lbl {
      font-size: 1rem;
      font-weight: 500;
      letter-spacing: -0.3px;
      color: var(--text-1);
    }

    .switch { position: relative; cursor: pointer; -webkit-tap-highlight-color: transparent; }
    .switch input { display: none; }

    .track {
      display: block;
      width: 51px; height: 31px;
      background: var(--bg-card-2);
      border-radius: 31px;
      position: relative;
      transition: background 0.25s cubic-bezier(0.4,0,0.2,1);
    }
    .track.on { background: #03b26c; }

    .thumb {
      position: absolute;
      top: 2px; left: 2px;
      width: 27px; height: 27px;
      background: #fff;
      border-radius: 50%;
      box-shadow: 0 1px 4px rgba(0,0,0,0.25);
      transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
    }
    .track.on .thumb { transform: translateX(20px); }
  `]
})
export class SavingToggle {
  @Input() active = false;
  @Output() toggle = new EventEmitter<boolean>();
}
