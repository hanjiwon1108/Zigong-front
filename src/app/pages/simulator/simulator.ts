import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Api } from '../../services/api';
import { GlassCard } from '../../components/glass-card/glass-card';

@Component({
  selector: 'app-simulator',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, GlassCard],
  templateUrl: './simulator.html',
  styleUrl: './simulator.css'
})
export class Simulator implements OnInit {
  analytics: any = null;
  loading: boolean = true;
  savingMode: boolean = false;

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['현재 자산', '1년 후', '3년 후', '5년 후'],
    datasets: []
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#f8fafc', font: { family: 'Inter', size: 14 } } },
      tooltip: { titleFont: { family: 'Inter' }, bodyFont: { family: 'Inter' } }
    },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };

  constructor(private api: Api) {}

  ngOnInit() {
    this.api.getAnalytics(1).subscribe(res => {
      this.analytics = res;
      this.updateChart();
      this.loading = false;
    });
  }

  toggleSimulation() {
    this.savingMode = !this.savingMode;
    this.updateChart();
  }

  updateChart() {
    if (!this.analytics) return;

    // 현재 기준 자산을 1,000만원이라 가정
    const baseAsset = 10000000;
    const simulatedLine = [baseAsset];
    const extraSavingPerYear = 300000 * 12; // 월 30만원 추가 절약

    this.analytics.predictions.forEach((p: any) => {
      if(this.savingMode) {
        simulatedLine.push(p.predicted_amount + (extraSavingPerYear * p.year));
      } else {
        simulatedLine.push(p.predicted_amount);
      }
    });

    const dataset = {
      data: simulatedLine,
      label: this.savingMode ? '배달/쇼핑 절약 시나리오 자산 (시뮬레이션)' : '소비 패턴 유지 시 예상 자산 (+선형 회귀 추정값)',
      fill: true,
      tension: 0.4,
      borderColor: this.savingMode ? '#10b981' : '#3b82f6',
      backgroundColor: this.savingMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
      pointBackgroundColor: this.savingMode ? '#10b981' : '#3b82f6',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: this.savingMode ? '#10b981' : '#3b82f6'
    };

    this.lineChartData = {
      labels: ['현재 자산', '1년 후', '3년 후', '5년 후'],
      datasets: [dataset]
    };
  }
}
