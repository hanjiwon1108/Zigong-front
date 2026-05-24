import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'feature-saving-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="row" [class.active]="active" role="group" [attr.aria-label]="label">
      <div class="copy">
        <span class="icon" aria-hidden="true">
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 2v20" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </span>
        <span class="text">
          <span class="lbl">{{ label }}</span>
          <span class="desc">{{
            active ? '자산 곡선에 절약 효과를 반영했어요' : '켜면 절약 시나리오를 같이 비교해요'
          }}</span>
        </span>
      </div>
      <label class="switch">
        <input
          type="checkbox"
          [checked]="active"
          (change)="toggle.emit(!active)"
          [attr.aria-label]="label + ' 전환'"
        />
        <span class="track" [class.on]="active">
          <span class="thumb"></span>
        </span>
      </label>
    </div>
  `,
  styles: [
    `
      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding: 18px 0;
        min-height: 76px;
        transition:
          background 0.22s,
          color 0.22s;
      }
      .row.active {
        color: var(--green);
      }
      .copy {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
      }
      .icon {
        width: 40px;
        height: 40px;
        display: grid;
        place-items: center;
        flex-shrink: 0;
        border-radius: 12px;
        background: var(--blue-bg);
        color: var(--blue);
        transition:
          background 0.22s,
          color 0.22s;
      }
      .row.active .icon {
        background: var(--green-bg);
        color: var(--green);
      }
      .text {
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 0;
      }
      .lbl {
        font-size: 1rem;
        font-weight: 800;
        line-height: 1.35;
        letter-spacing: -0.3px;
        color: var(--text-1);
      }
      .desc {
        font-size: 0.78rem;
        font-weight: 500;
        line-height: 1.45;
        color: var(--text-3);
        letter-spacing: -0.1px;
      }

      .switch {
        position: relative;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }
      .switch input {
        display: none;
      }

      .track {
        display: block;
        width: 51px;
        height: 31px;
        background: var(--bg-card-2);
        border-radius: 31px;
        position: relative;
        box-shadow: inset 0 0 0 1px var(--divider);
        transition:
          background 0.25s cubic-bezier(0.4, 0, 0.2, 1),
          box-shadow 0.25s;
      }
      .track.on {
        background: var(--green);
        box-shadow: inset 0 0 0 1px transparent;
      }

      .thumb {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 27px;
        height: 27px;
        background: #fff;
        border-radius: 50%;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
        transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .track.on .thumb {
        transform: translateX(20px);
      }

      @media (max-width: 360px) {
        .icon {
          display: none;
        }
        .desc {
          font-size: 0.74rem;
        }
      }
    `,
  ],
})
export class SavingToggle {
  @Input() active = false;
  @Input() amount = 300_000;
  @Output() toggle = new EventEmitter<boolean>();

  get label(): string {
    return `월 ${new Intl.NumberFormat('ko-KR').format(this.amount)}원 절약 모드`;
  }
}
