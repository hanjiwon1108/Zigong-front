import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthApi, LoginPayload, SignupPayload } from '../../entities/auth/api/auth.api';
import { saveAuth } from '../../shared/model/auth.storage';

type AuthMode = 'signup' | 'login';

@Component({
  selector: 'page-auth',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class AuthPage {
  private authApi = inject(AuthApi);
  private router = inject(Router);

  mode: AuthMode = 'signup';
  name = '';
  email = '';
  password = '';
  monthlyIncome = '';
  totalAssets = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  switchMode(mode: AuthMode) {
    if (this.mode === mode) return;
    this.mode = mode;
    this.errorMessage = '';
    this.successMessage = '';
    if (mode === 'login') {
      this.name = '';
      this.monthlyIncome = '';
      this.totalAssets = '';
    }
  }

  onNameInput(value: string) {
    this.name = value;
  }

  onPasswordInput(value: string) {
    this.password = value;
  }

  onEmailInput(value: string) {
    this.email = value;
  }

  onMonthlyIncomeInput(value: string) {
    this.monthlyIncome = value;
  }

  onTotalAssetsInput(value: string) {
    this.totalAssets = value;
  }

  resetForm() {
    this.name = '';
    this.email = '';
    this.password = '';
    this.monthlyIncome = '';
    this.totalAssets = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';
    const trimmedName = this.name.trim();
    const trimmedEmail = this.email.trim();
    if (!trimmedName || !trimmedEmail || !this.password) {
      this.errorMessage = '이름, 이메일, 비밀번호를 입력해주세요.';
      return;
    }

    if (this.mode === 'signup') {
      const monthlyIncome = Number(this.monthlyIncome);
      const totalAssets = Number(this.totalAssets);
      if (!Number.isFinite(monthlyIncome) || !Number.isFinite(totalAssets)) {
        this.errorMessage = '월 수입과 총 자산을 숫자로 입력해주세요.';
        return;
      }
      this.handleSignup({
        name: trimmedName,
        email: trimmedEmail,
        password: this.password,
        monthly_income: monthlyIncome,
        total_assets: totalAssets,
      });
      return;
    }

    this.handleLogin({
      email: trimmedEmail,
      password: this.password,
    });
  }

  private handleSignup(payload: SignupPayload) {
    this.loading = true;
    this.authApi.signup(payload).subscribe({
      next: (res) => {
        saveAuth(res.token, res.user);
        this.successMessage = '회원가입이 완료되었습니다. 대시보드로 이동합니다.';
        this.loading = false;
        void this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.errorMessage = '회원가입에 실패했습니다. 이름을 다시 확인해주세요.';
        this.loading = false;
      },
    });
  }

  private handleLogin(payload: LoginPayload) {
    this.loading = true;
    this.authApi.login(payload).subscribe({
      next: (res) => {
        saveAuth(res.token, res.user);
        this.successMessage = '로그인되었습니다. 대시보드로 이동합니다.';
        this.loading = false;
        void this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.errorMessage = '로그인에 실패했습니다. 이름/비밀번호를 확인해주세요.';
        this.loading = false;
      },
    });
  }
}
