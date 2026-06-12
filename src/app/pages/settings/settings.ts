import { Component, OnInit, inject } from '@angular/core';
import { gsap } from 'gsap';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { User } from '../../shared/model/types';
import { clearAuth, getStoredUser, saveAuth, getAuthToken } from '../../shared/model/auth.storage';
import { UserApi } from '../../entities/user/api/user.api';

@Component({
  selector: 'page-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class SettingsPage implements OnInit {
  private router = inject(Router);
  private userApi = inject(UserApi);

  user: User | null = null;
  loading = false;
  successMessage = '';
  errorMessage = '';

  ngOnInit() {
    this.user = getStoredUser();
    if (!this.user) {
      void this.router.navigate(['/auth']);
      return;
    }
    setTimeout(() => {
      gsap.set('.page-header, .profile-card, .settings-card', { opacity: 0, y: 20 });
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.to('.page-header',   { opacity: 1, y: 0, duration: 0.4 })
        .to('.profile-card',  { opacity: 1, y: 0, duration: 0.45 }, '-=0.2')
        .to('.settings-card', { opacity: 1, y: 0, duration: 0.35, stagger: 0.1 }, '-=0.25');
    }, 30);
  }

  onNameInput(value: string) {
    if (!this.user) return;
    this.user = { ...this.user, name: value };
  }

  onEmailInput(value: string) {
    if (!this.user) return;
    this.user = { ...this.user, email: value };
  }

  onMonthlyIncomeInput(value: string) {
    if (!this.user) return;
    const amount = Number(value);
    this.user = { ...this.user, monthly_income: Number.isFinite(amount) ? amount : 0 };
  }

  onTotalAssetsInput(value: string) {
    if (!this.user) return;
    const amount = Number(value);
    this.user = { ...this.user, total_assets: Number.isFinite(amount) ? amount : 0 };
  }

  save() {
    if (!this.user) return;
    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.userApi.updateUser(this.user).subscribe({
      next: (updated) => {
        const token = getAuthToken();
        if (token) saveAuth(token, updated);
        this.user = updated;
        this.loading = false;
        this.successMessage = '정보가 저장되었습니다.';
      },
      error: () => {
        this.loading = false;
        this.errorMessage = '정보 저장에 실패했습니다. 다시 시도해주세요.';
      },
    });
  }

  logout() {
    clearAuth();
    void this.router.navigate(['/auth']);
  }
}
