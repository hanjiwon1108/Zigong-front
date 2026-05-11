import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { UserApi } from '../../entities/user/api/user.api';
import { AnalyticsApi } from '../../entities/analytics/api/analytics.api';
import { SavingToggle } from '../../features/asset-simulator/saving-toggle';
import { User, Analytics } from '../../shared/model/types';
import { lineOptions } from '../../widgets/chart/chart-options';

const MONTHLY_SAVING = 300_000;

@Component({
  selector: 'page-simulator',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, SavingToggle],
  templateUrl: './simulator.html',
  styleUrl: './simulator.css'
})
export class SimulatorPage implements OnInit {
  private userApi = inject(UserApi);
  private analyticsApi = inject(AnalyticsApi);

  user: User | null = null;
  analytics: Analytics | null = null;
  loading = true;
  savingMode = false;

  lineData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  readonly lineOptions = lineOptions;

  ngOnInit() {
    forkJoin({ user: this.userApi.getUser(), analytics: this.analyticsApi.getAnalytics() })
      .subscribe(({ user, analytics }) => {
        this.user = user;
        this.analytics = analytics;
        this.rebuildChart();
        this.loading = false;
      });
  }

  onToggle(active: boolean) {
    this.savingMode = active;
    this.rebuildChart();
  }

  simulatedAmount(predIdx: number): number {
    if (!this.analytics) return 0;
    const p = this.analytics.predictions[predIdx];
    return this.savingMode ? p.predicted_amount + MONTHLY_SAVING * 12 * p.year : p.predicted_amount;
  }

  private rebuildChart() {
    if (!this.analytics || !this.user) return;
    const color = this.savingMode ? '#00C37D' : '#3182F6';
    const bg    = this.savingMode ? 'rgba(0,195,125,0.12)' : 'rgba(49,130,246,0.12)';
    const points = [this.user.total_assets, ...this.analytics.predictions.map((_, i) => this.simulatedAmount(i))];

    this.lineData = {
      labels: ['현재', '1년 후', '3년 후', '5년 후'],
      datasets: [{
        data: points,
        label: this.savingMode ? '절약 시나리오' : '현재 패턴 유지',
        fill: true,
        tension: 0.4,
        borderColor: color,
        backgroundColor: bg,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: color,
        pointRadius: 6,
        pointHoverRadius: 9
      }]
    };
  }
}
