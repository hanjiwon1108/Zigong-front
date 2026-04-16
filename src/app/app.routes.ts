import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Simulator } from './pages/simulator/simulator';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: Dashboard },
    { path: 'simulator', component: Simulator }
];
