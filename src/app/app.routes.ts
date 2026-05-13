import { Routes } from '@angular/router';
import { DashboardPage } from './pages/dashboard/dashboard';
import { AnalyticsPage } from './pages/analytics/analytics';
import { TransactionsPage } from './pages/transactions/transactions';
import { SimulatorPage } from './pages/simulator/simulator';
import { AuthPage } from './pages/auth/auth';
import { SettingsPage } from './pages/settings/settings';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'auth', component: AuthPage },
  { path: 'dashboard', component: DashboardPage },
  { path: 'analytics', component: AnalyticsPage },
  { path: 'transactions', component: TransactionsPage },
  { path: 'simulator', component: SimulatorPage },
  { path: 'settings', component: SettingsPage },
];
