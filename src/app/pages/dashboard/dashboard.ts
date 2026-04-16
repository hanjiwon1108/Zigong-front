import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api } from '../../services/api';
import { GlassCard } from '../../components/glass-card/glass-card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, GlassCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  analytics: any = null;
  transactions: any[] = [];
  anomalies: any[] = [];
  loading = true;

  constructor(private api: Api) {}

  ngOnInit() {
    this.api.getAnalytics(1).subscribe(res => {
      this.analytics = res;
      this.checkLoading();
    });
    this.api.getTransactions(1).subscribe(res => {
      this.transactions = res.slice(0, 7); // 최근 7건
      this.checkLoading();
    });
    this.api.getAnomalies(1).subscribe(res => {
      this.anomalies = res.slice(0, 3); // 심각한 것 최대 3건
      this.checkLoading();
    });
  }

  checkLoading() {
    if(this.analytics && this.transactions) {
      this.loading = false;
    }
  }
}
