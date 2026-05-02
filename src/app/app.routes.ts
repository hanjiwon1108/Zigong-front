import { Routes } from '@angular/router';
import { DashboardPage } from './pages/dashboard/dashboard';
import { AnalyticsPage } from './pages/analytics/analytics';
import { TransactionsPage } from './pages/transactions/transactions';
import { SimulatorPage } from './pages/simulator/simulator';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard',    component: DashboardPage },
  { path: 'analytics',   component: AnalyticsPage },
  { path: 'transactions', component: TransactionsPage },
  { path: 'simulator',   component: SimulatorPage },
];
