import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { AnalyticsApi } from '../../entities/analytics/api/analytics.api';
import { TransactionApi } from '../../entities/transaction/api/transaction.api';
import { Analytics, Transaction, CATEGORY_COLORS, Category } from '../../shared/model/types';
import { doughnutOptions, barOptions } from '../../widgets/chart/chart-options';

interface CategoryStat {
  category: Category;
  amount: number;
  ratio: number;
  color: string;
}

@Component({
  selector: 'page-analytics',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css'
})
export class AnalyticsPage implements OnInit {
  private analyticsApi = inject(AnalyticsApi);
  private txApi = inject(TransactionApi);

  analytics: Analytics | null = null;
  categoryStats: CategoryStat[] = [];
  loading = true;

  doughnutData: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [] };
  barData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  readonly doughnutOptions = doughnutOptions;
  readonly barOptions = barOptions;

  ngOnInit() {
    forkJoin({
      analytics: this.analyticsApi.getAnalytics(),
      transactions: this.txApi.getTransactions()
    }).subscribe(({ analytics, transactions }) => {
      this.analytics = analytics;
      this.categoryStats = this.buildCategoryStats(transactions);
      this.doughnutData = this.buildDoughnut(this.categoryStats);
      this.barData = this.buildBar(transactions);
      this.loading = false;
    });
  }

  private buildCategoryStats(txs: Transaction[]): CategoryStat[] {
    const totals: Partial<Record<Category, number>> = {};
    for (const t of txs) totals[t.category] = (totals[t.category] ?? 0) + t.amount;
    const total = Object.values(totals).reduce((s, v) => s + (v ?? 0), 0);
    return (Object.entries(totals) as [Category, number][])
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({
        category,
        amount,
        ratio: total > 0 ? Math.round(amount / total * 100) : 0,
        color: CATEGORY_COLORS[category]
      }));
  }

  private buildDoughnut(stats: CategoryStat[]): ChartConfiguration<'doughnut'>['data'] {
    return {
      labels: stats.map(s => s.category),
      datasets: [{
        data: stats.map(s => s.amount),
        backgroundColor: stats.map(s => s.color),
        borderColor: 'rgba(15,23,42,0.8)',
        borderWidth: 2,
        hoverOffset: 8
      }]
    };
  }

  private buildBar(txs: Transaction[]): ChartConfiguration<'bar'>['data'] {
    const monthMap: Record<string, number> = {};
    for (const t of txs) {
      const m = t.date.slice(0, 7);
      monthMap[m] = (monthMap[m] ?? 0) + t.amount;
    }
    const sorted = Object.entries(monthMap).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
    return {
      labels: sorted.map(([m]) => m.slice(2)),
      datasets: [{
        data: sorted.map(([, v]) => v),
        backgroundColor: 'rgba(59,130,246,0.55)',
        borderColor: '#3b82f6',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      }]
    };
  }
}
