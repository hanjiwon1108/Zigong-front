import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { AnalyticsApi } from '../../entities/analytics/api/analytics.api';
import { TransactionApi } from '../../entities/transaction/api/transaction.api';
import { Analytics, Transaction, Category } from '../../shared/model/types';
import { doughnutOptions, barOptions } from '../../widgets/chart/chart-options';

interface CategoryStat {
  category: Category;
  amount: number;
  ratio: number;
  color: string;
}

interface MonthlySummary {
  latestLabel: string;
  latestAmount: number;
  diffAmount: number;
  diffRatio: number;
  trend: 'up' | 'down' | 'same';
}

const TDS_CATEGORY_PALETTE: Record<Category, string> = {
  '식비': '#3182f6',
  '배달': '#f04452',
  '카페': '#fe9800',
  '쇼핑': '#a234c7',
  '교통': '#03b26c',
  '구독 서비스': '#18a5a5',
  '문화': '#f97316',
  '미용': '#ec4899',
  '의료': '#14b8a6',
  '기타': '#8b95a1',
};

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
  totalCategoryAmount = 0;
  topCategoryStat: CategoryStat | null = null;
  monthlySummary: MonthlySummary = {
    latestLabel: '',
    latestAmount: 0,
    diffAmount: 0,
    diffRatio: 0,
    trend: 'same'
  };
  readonly categoryChartPalette = TDS_CATEGORY_PALETTE;
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
      this.totalCategoryAmount = this.categoryStats.reduce((sum, stat) => sum + stat.amount, 0);
      this.topCategoryStat = this.categoryStats[0] ?? null;
      this.doughnutData = this.buildDoughnut(this.categoryStats);
      const monthly = this.buildMonthlySeries(transactions);
      this.monthlySummary = this.buildMonthlySummary(monthly);
      this.barData = this.buildBar(monthly);
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
        color: this.categoryChartPalette[category] ?? '#8b95a1'
      }));
  }

  private buildDoughnut(stats: CategoryStat[]): ChartConfiguration<'doughnut'>['data'] {
    const hasData = stats.length > 0;
    return {
      labels: hasData ? stats.map(s => s.category) : ['지출 없음'],
      datasets: [{
        data: hasData ? stats.map(s => s.amount) : [1],
        backgroundColor: hasData ? stats.map(s => s.color) : ['rgba(139,149,161,0.18)'],
        borderColor: this.cssVar('--bg-card', '#ffffff'),
        borderWidth: 4,
        hoverBorderWidth: 4,
        hoverOffset: hasData ? 4 : 0,
        spacing: 2
      }]
    };
  }

  private buildMonthlySeries(txs: Transaction[]): [string, number][] {
    const monthMap: Record<string, number> = {};
    for (const t of txs) {
      const m = t.date.slice(0, 7);
      monthMap[m] = (monthMap[m] ?? 0) + t.amount;
    }
    return Object.entries(monthMap).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
  }

  private buildMonthlySummary(monthly: [string, number][]): MonthlySummary {
    const latest = monthly.at(-1);
    const previous = monthly.at(-2);
    const latestAmount = latest?.[1] ?? 0;
    const previousAmount = previous?.[1] ?? 0;
    const diffAmount = latestAmount - previousAmount;
    const diffRatio = previousAmount > 0 ? Math.round((diffAmount / previousAmount) * 100) : 0;
    return {
      latestLabel: latest ? `${Number(latest[0].slice(5))}월` : '최근 월',
      latestAmount,
      diffAmount,
      diffRatio,
      trend: diffAmount > 0 ? 'up' : diffAmount < 0 ? 'down' : 'same'
    };
  }

  private buildBar(monthly: [string, number][]): ChartConfiguration<'bar'>['data'] {
    const sorted = monthly.length > 0 ? monthly : [['-', 0] as [string, number]];
    return {
      labels: sorted.map(([m]) => m === '-' ? '없음' : `${Number(m.slice(5))}월`),
      datasets: [{
        data: sorted.map(([, v]) => v),
        backgroundColor: this.cssVar('--blue', '#3182f6'),
        hoverBackgroundColor: this.cssVar('--color-blue-400', '#4593fc'),
        borderRadius: 10,
        borderSkipped: false,
        maxBarThickness: 32
      }]
    };
  }

  private cssVar(name: string, fallback: string): string {
    if (typeof document === 'undefined') return fallback;
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  }
}
