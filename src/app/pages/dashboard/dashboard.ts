import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
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
  styleUrl: './dashboard.css'
})
export class DashboardPage implements OnInit {
  private userApi = inject(UserApi);
  private txApi = inject(TransactionApi);
  private analyticsApi = inject(AnalyticsApi);

  user: User | null = null;
  analytics: Analytics | null = null;
  recentTx: Transaction[] = [];
  anomalies: Anomaly[] = [];
  loading = true;

  ngOnInit() {
    forkJoin({
      user: this.userApi.getUser(),
      analytics: this.analyticsApi.getAnalytics(),
      transactions: this.txApi.getTransactions(),
      anomalies: this.txApi.getAnomalies()
    }).subscribe(({ user, analytics, transactions, anomalies }) => {
      this.user = user;
      this.analytics = analytics;
      this.recentTx = transactions.slice(0, 7);
      this.anomalies = anomalies.slice(0, 3);
      this.loading = false;
    });
  }

  get monthlySaving(): number {
    if (!this.user || !this.analytics) return 0;
    return this.user.monthly_income - this.analytics.total_spent_last_30_days;
  }
}
