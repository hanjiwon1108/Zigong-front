import { CommonModule } from '@angular/common';
import { Component, DestroyRef, HostListener, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { HelpTourService } from './help-tour.service';

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

@Component({
  selector: 'app-help-tour-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help-tour-overlay.html',
  styleUrl: './help-tour-overlay.css'
})
export class HelpTourOverlay {
  readonly tour = inject(HelpTourService);
  private readonly destroyRef = inject(DestroyRef);
  private measureTimer: ReturnType<typeof setTimeout> | null = null;
  private motionTimer: ReturnType<typeof setTimeout> | null = null;
  private measureAttempts = 0;
  private lastMotionKey = '';

  readonly rect = signal<HighlightRect | null>(null);
  readonly panelStyle = signal<Record<string, string>>({});
  readonly isStepChanging = signal(false);
  readonly progressStyle = computed(() => {
    const total = this.tour.steps().length;
    const current = this.tour.index() + 1;
    return { width: `${total > 0 ? current / total * 100 : 0}%` };
  });
  readonly topMaskStyle = computed(() => {
    const rect = this.rect();
    return { height: `${Math.max(rect?.top ?? 0, 0)}px` };
  });
  readonly bottomMaskStyle = computed(() => {
    const rect = this.rect();
    const top = rect ? rect.top + rect.height : 0;
    return { top: `${top}px` };
  });
  readonly leftMaskStyle = computed(() => {
    const rect = this.rect();
    if (!rect) return {};
    return {
      top: `${rect.top}px`,
      width: `${rect.left}px`,
      height: `${rect.height}px`
    };
  });
  readonly rightMaskStyle = computed(() => {
    const rect = this.rect();
    if (!rect) return {};
    return {
      top: `${rect.top}px`,
      left: `${rect.left + rect.width}px`,
      height: `${rect.height}px`
    };
  });
  readonly highlightStyle = computed(() => {
    const rect = this.rect();
    if (!rect) return {};
    return {
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`
    };
  });

  constructor() {
    effect(() => {
      const key = this.tour.currentStep()?.targetId ?? '';
      const active = this.tour.active();
      queueMicrotask(() => this.triggerStepMotion(active ? key : ''));
      this.scheduleMeasure(true);
    });

    fromEvent(window, 'resize')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.scheduleMeasure(false));

    fromEvent(window, 'scroll', { capture: true })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.scheduleMeasure(false));
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.tour.close();
  }

  async next(): Promise<void> {
    await this.tour.next();
  }

  async previous(): Promise<void> {
    await this.tour.previous();
  }

  private scheduleMeasure(resetAttempts: boolean): void {
    if (this.measureTimer) clearTimeout(this.measureTimer);
    if (resetAttempts) this.measureAttempts = 0;

    this.measureTimer = setTimeout(() => this.measure(), resetAttempts ? 80 : 20);
  }

  private triggerStepMotion(key: string): void {
    if (!key) {
      this.lastMotionKey = '';
      this.isStepChanging.set(false);
      return;
    }

    if (this.lastMotionKey === key) return;
    this.lastMotionKey = key;
    if (this.motionTimer) clearTimeout(this.motionTimer);

    this.isStepChanging.set(false);
    requestAnimationFrame(() => {
      this.isStepChanging.set(true);
      this.motionTimer = setTimeout(() => this.isStepChanging.set(false), 520);
    });
  }

  private measure(): void {
    if (!this.tour.active()) {
      this.rect.set(null);
      return;
    }

    const step = this.tour.currentStep();
    if (!step) return;

    const target = document.querySelector<HTMLElement>(`[data-tour-id="${step.targetId}"]`);
    if (!target) {
      this.retryOrSkip();
      return;
    }

    const firstRect = target.getBoundingClientRect();
    const isOutOfView = firstRect.bottom < 0 || firstRect.top > window.innerHeight;
    if (isOutOfView) {
      target.scrollIntoView({ block: 'center', behavior: 'smooth' });
      if (this.measureTimer) clearTimeout(this.measureTimer);
      this.measureTimer = setTimeout(() => this.measure(), 600);
      return;
    }

    const rawRect = target.getBoundingClientRect();
    if (rawRect.width <= 0 || rawRect.height <= 0) {
      this.retryOrSkip();
      return;
    }

    const padding = 8;
    const nextRect = {
      top: Math.max(rawRect.top - padding, 8),
      left: Math.max(rawRect.left - padding, 8),
      width: Math.min(rawRect.width + padding * 2, window.innerWidth - Math.max(rawRect.left - padding, 8) - 8),
      height: Math.min(rawRect.height + padding * 2, window.innerHeight - Math.max(rawRect.top - padding, 8) - 8)
    };

    this.rect.set(nextRect);
    this.panelStyle.set(this.buildPanelStyle(nextRect));
  }

  private retryOrSkip(): void {
    this.measureAttempts += 1;
    if (this.measureAttempts < 12) {
      this.measureTimer = setTimeout(() => this.measure(), 120);
      return;
    }

    void this.tour.skipMissingTarget();
  }

  private buildPanelStyle(rect: HighlightRect): Record<string, string> {
    const gap = 14;
    const width = Math.min(320, window.innerWidth - 32);
    const hasRoomBelow = rect.top + rect.height + gap + 190 < window.innerHeight;
    const top = hasRoomBelow
      ? rect.top + rect.height + gap
      : Math.max(16, rect.top - 206);
    const centeredLeft = rect.left + rect.width / 2 - width / 2;
    const left = Math.min(Math.max(16, centeredLeft), window.innerWidth - width - 16);

    return {
      width: `${width}px`,
      top: `${top}px`,
      left: `${left}px`
    };
  }
}
