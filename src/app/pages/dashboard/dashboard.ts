import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, catchError, of } from 'rxjs';
import { gsap } from 'gsap';
import { UserApi } from '../../entities/user/api/user.api';
import { TransactionApi } from '../../entities/transaction/api/transaction.api';
import { AnalyticsApi } from '../../entities/analytics/api/analytics.api';
import { CategoryTag } from '../../shared/ui/category-tag';
import { User, Transaction, Analytics, Anomaly } from '../../shared/model/types';

@Component({
  selector: 'page-dashboard',
  standalone: true,
  imports: [CommonModule, CategoryTag],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardPage implements OnInit {
  private userApi = inject(UserApi);
  private txApi = inject(TransactionApi);
  private analyticsApi = inject(AnalyticsApi);
  private cdr = inject(ChangeDetectorRef);
  private readonly numberFormatter = new Intl.NumberFormat('ko-KR');

  user: User | null = null;
  analytics: Analytics | null = null;
  recentTx: Transaction[] = [];
  anomalies: Anomaly[] = [];
  loading = true;

  displayedAsset = 0;
  private _targetAsset = 0;

  ngOnInit() {
    forkJoin({
      user: this.userApi.getUser(),
      analytics: this.analyticsApi.getAnalytics(),
      transactions: this.txApi.getTransactions(),
    }).subscribe(({ user, analytics, transactions }) => {
      this.user = user;
      this.analytics = analytics;
      this.recentTx = transactions.slice(0, 7);
      this._targetAsset = user.total_assets;
      this.loading = false;
      setTimeout(() => this.runEntryAnimations(), 60);

      // anomalies는 별도 로드 — 모델 학습 때문에 느려도 메인 화면 안 막음
      this.txApi.getAnomalies().pipe(catchError(() => of([]))).subscribe(anomalies => {
        this.anomalies = anomalies.slice(0, 3);
        this.cdr.detectChanges();
      });
    });
  }

  private runEntryAnimations() {
    gsap.set('.greeting, .hero-card, .sum-card, .section-title, .card-block, .tx-row, .alert-row', {
      opacity: 0,
      y: 20,
    });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.greeting',  { opacity: 1, y: 0, duration: 0.5 })
      .to('.hero-card', { opacity: 1, y: 0, duration: 0.55, scale: 1 }, '-=0.3')
      .to('.sum-card',  { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 }, '-=0.25')
      .to('.section-title', { opacity: 1, y: 0, duration: 0.35, stagger: 0.08 }, '-=0.15')
      .to('.alert-row', { opacity: 1, y: 0, duration: 0.35, stagger: 0.07 }, '-=0.1')
      .to('.card-block', { opacity: 1, y: 0, duration: 0.4 }, '-=0.2')
      .to('.tx-row',    { opacity: 1, y: 0, duration: 0.3, stagger: 0.05 }, '-=0.3');

    // number count-up
    const counter = { val: 0 };
    gsap.to(counter, {
      val: this._targetAsset,
      duration: 1.6,
      ease: 'power2.out',
      delay: 0.5,
      onUpdate: () => {
        this.displayedAsset = Math.round(counter.val);
      },
    });
  }

  get monthlySaving(): number {
    if (!this.user || !this.analytics) return 0;
    return this.user.monthly_income - this.analytics.total_spent_last_30_days;
  }

  get monthlySavingDisplay(): string {
    return this.formatSignedNumber(this.monthlySaving);
  }

  get displayedAssetFormatted(): string {
    return this.numberFormatter.format(this.displayedAsset);
  }

  private formatSignedNumber(value: number): string {
    const sign = value < 0 ? '-' : '+';
    return `${sign}${this.numberFormatter.format(Math.abs(value))}`;
  }
}
