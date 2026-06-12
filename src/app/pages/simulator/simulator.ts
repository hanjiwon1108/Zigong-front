import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { gsap } from 'gsap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { UserApi } from '../../entities/user/api/user.api';
import { AnalyticsApi } from '../../entities/analytics/api/analytics.api';
import { FinancialProductApi } from '../../entities/financial-product/api/financial-product.api';
import { SavingToggle } from '../../features/asset-simulator/saving-toggle';
import {
  User,
  Analytics,
  AssetPrediction,
  FssProduct,
  UserFinancialProduct,
  CardEvent,
  Category,
} from '../../shared/model/types';
import { lineOptions } from '../../widgets/chart/chart-options';

const DEFAULT_MONTHLY_SAVING = 300_000;
const DEFAULT_SIMULATION_YEARS = 5;
const MAX_MONTHLY_SAVING = 3_000_000;
const PENSION_RATE = 0.045;         // 국민연금 본인 부담
const HEALTH_RATE = 0.03545;        // 건강보험 본인 부담 (2024)
const LONG_CARE_RATE = 0.004591;    // 장기요양보험 (건강보험료 × 12.95%)
const EMPLOYMENT_RATE = 0.009;      // 고용보험 본인 부담
const PENSION_RETURN_RATE = 0.6;
const LS_SAVING = 'sim_monthly_saving';
const LS_YEARS = 'sim_years';
const LS_SAVING_MODE = 'sim_saving_mode';
const MAX_CARD_EVENTS = 20;
const EXPO_SAVING_NAME = '2030부산월드엑스포적금';
const EXPO_SAVING_BANK = 'BNK부산은행';
const EXPO_SAVING_CODE = 'BNK_EXPO_2030';

function parseNumber(value: string | null): number | null {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

@Component({
  selector: 'page-simulator',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, SavingToggle],
  templateUrl: './simulator.html',
  styleUrl: './simulator.css',
})
export class SimulatorPage implements OnInit, OnDestroy {
  private userApi = inject(UserApi);
  private analyticsApi = inject(AnalyticsApi);
  private productApi = inject(FinancialProductApi);
  private cdr = inject(ChangeDetectorRef);
  private readonly numberFormatter = new Intl.NumberFormat('ko-KR');
  private cardWs: WebSocket | null = null;

  user: User | null = null;
  analytics: Analytics | null = null;
  loading = true;
  readonly yearOptions = [1, 3, 5];
  savingMode = localStorage.getItem(LS_SAVING_MODE) === 'true';
  monthlySaving = Math.min(
    Math.max(parseNumber(localStorage.getItem(LS_SAVING)) ?? DEFAULT_MONTHLY_SAVING, 0),
    MAX_MONTHLY_SAVING,
  );
  simulationYears = DEFAULT_SIMULATION_YEARS;

  pensionEnabled = false;
  insuranceEnabled = false;

  // 카드 실시간 이벤트
  cardEvents: CardEvent[] = [];
  cardEventConnected = false;

  // 카드 내역 직접 입력
  readonly categories: Category[] = ['식비', '배달', '카페', '쇼핑', '교통', '구독 서비스', '문화', '미용', '의료', '기타'];
  injectForm = { merchant: '', category: '식비' as Category, amount: null as number | null };
  injectLoading = false;

  // 금융상품
  savingProducts: FssProduct[] = [];
  depositProducts: FssProduct[] = [];
  userProducts: UserFinancialProduct[] = [];
  showProductModal = false;
  productTab: 'saving' | 'deposit' = 'saving';
  selectedProduct: FssProduct | null = null;
  selectedOption: {
    intr_rate: number;
    intr_rate2: number;
    save_trm: number;
    rsrv_type_nm: string;
  } | null = null;
  newMonthlyAmount = 100000;
  newStartDate = new Date().toISOString().slice(0, 10);
  productLoading = false;
  productSearchTerm = '';

  displayedSimAmount = 0;

  lineData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  readonly lineOptions = lineOptions;

  private animateSimAmount(target: number) {
    const counter = { val: this.displayedSimAmount };
    gsap.to(counter, {
      val: target,
      duration: 1.4,
      ease: 'power2.out',
      onUpdate: () => {
        this.displayedSimAmount = Math.round(counter.val);
        this.cdr.detectChanges();
      },
    });
  }

  // ── 기본 시뮬레이션 ──────────────────────────────────────────────

  get baseAmountByTargetYear(): number {
    return this.predictedAmountByYear(this.simulationYears);
  }

  get savingAmountByTargetYear(): number {
    return this.baseAmountByTargetYear + this.monthlySaving * 12 * this.simulationYears;
  }

  get savingGainByTargetYear(): number {
    return this.savingAmountByTargetYear - this.baseAmountByTargetYear;
  }

  get targetGrowthRate(): number {
    if (!this.user || this.user.total_assets <= 0) return 0;
    return Math.round(
      ((this.displayTargetAmount +
        this.totalProductGainByYear(this.simulationYears) -
        this.user.total_assets) /
        this.user.total_assets) *
        100,
    );
  }

  get displayTargetAmount(): number {
    const base = this.savingMode ? this.savingAmountByTargetYear : this.baseAmountByTargetYear;
    return base - this.insuranceAdjustmentByYear;
  }

  get productGainTarget(): number {
    return this.totalProductGainByYear(this.simulationYears);
  }

  get targetPrediction(): AssetPrediction | null {
    if (!this.analytics?.predictions?.length) return null;
    return (
      this.analytics.predictions.find((p) => p.year === this.simulationYears) ??
      this.analytics.predictions.at(-1) ??
      null
    );
  }

  get targetPredictionYear(): number {
    return this.targetPrediction?.year ?? this.simulationYears;
  }

  get targetGrowthRateDisplay(): string {
    return this.formatSignedPercent(this.targetGrowthRate);
  }

  private formatSignedPercent(value: number): string {
    const sign = value < 0 ? '-' : '+';
    return `${sign}${this.numberFormatter.format(Math.abs(value))}%`;
  }

  // ── 금융상품 계산 ────────────────────────────────────────────────

  /** 단리 적금 만기 수령액 계산 */
  calcMaturityAmount(p: UserFinancialProduct): number {
    const n = p.save_trm; // 개월
    const r = p.intr_rate / 100 / 12;
    // 단리 정기적금: 원금 + 이자
    const principal = p.monthly_amount * n;
    const interest = (p.monthly_amount * r * (n * (n + 1))) / 2;
    return Math.round(principal + interest);
  }

  /** 특정 연도까지 만기 도래한 상품의 총 수령액 */
  totalProductGainByYear(year: number): number {
    const targetDate = new Date();
    targetDate.setFullYear(targetDate.getFullYear() + year);
    return this.userProducts.reduce((sum, p) => {
      const maturity = new Date(p.start_date);
      maturity.setMonth(maturity.getMonth() + p.save_trm);
      if (maturity <= targetDate) {
        sum += this.calcMaturityAmount(p);
      }
      return sum;
    }, 0);
  }

  // ── 4대보험 계산 ─────────────────────────────────────────────────

  get monthlyPensionContribution(): number {
    return Math.round((this.user?.monthly_income ?? 0) * PENSION_RATE);
  }

  get monthlyHealthInsurance(): number {
    return Math.round((this.user?.monthly_income ?? 0) * HEALTH_RATE);
  }

  get monthlyLongCareInsurance(): number {
    return Math.round(this.monthlyHealthInsurance * (LONG_CARE_RATE / HEALTH_RATE));
  }

  get monthlyEmploymentInsurance(): number {
    return Math.round((this.user?.monthly_income ?? 0) * EMPLOYMENT_RATE);
  }

  get totalMonthlyInsurance(): number {
    return (
      this.monthlyPensionContribution +
      this.monthlyHealthInsurance +
      this.monthlyLongCareInsurance +
      this.monthlyEmploymentInsurance
    );
  }

  get monthlyNetIncome(): number {
    return (this.user?.monthly_income ?? 0) - this.totalMonthlyInsurance;
  }

  get estimatedMonthlyPension(): number {
    const totalPaid = this.monthlyPensionContribution * 12 * this.simulationYears;
    return Math.round((totalPaid * PENSION_RETURN_RATE) / 240);
  }

  // 4대보험 공제 반영 시 시뮬레이션 조정액 (연간)
  get insuranceAdjustmentByYear(): number {
    return this.insuranceEnabled ? this.totalMonthlyInsurance * 12 * this.simulationYears : 0;
  }

  // ── 카드 이벤트 WebSocket ────────────────────────────────────────

  connectCardEvents() {
    if (this.cardWs) return;
    const host = window.location.hostname;
    this.cardWs = new WebSocket(`ws://${host}:8000/ws/card-events`);
    this.cardWs.onopen = () => (this.cardEventConnected = true);
    this.cardWs.onmessage = (e) => {
      const event: CardEvent = JSON.parse(e.data);
      this.cardEvents = [event, ...this.cardEvents].slice(0, MAX_CARD_EVENTS);
    };
    this.cardWs.onclose = () => {
      this.cardEventConnected = false;
      this.cardWs = null;
    };
  }

  disconnectCardEvents() {
    this.cardWs?.close();
    this.cardWs = null;
    this.cardEventConnected = false;
  }

  async injectCardEvent() {
    const { merchant, category, amount } = this.injectForm;
    if (!merchant.trim() || !amount || amount <= 0 || !this.user) return;
    this.injectLoading = true;
    try {
      const host = window.location.hostname;
      await fetch(`http://${host}:8000/api/card-events/inject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: this.user.id, merchant: merchant.trim(), category, amount }),
      });
      this.injectForm = { merchant: '', category: '식비', amount: null };
    } finally {
      this.injectLoading = false;
    }
  }

  ngOnDestroy() {
    this.disconnectCardEvents();
  }

  // ── 라이프사이클 ─────────────────────────────────────────────────

  ngOnInit() {
    this.initializeSimulationYears();
    forkJoin({
      user: this.userApi.getUser(),
      analytics: this.analyticsApi.getAnalytics(),
      userProducts: this.productApi.getUserProducts(),
      savingProducts: this.productApi.getSavingProducts(),
      depositProducts: this.productApi.getDepositProducts(),
    }).subscribe({
      next: ({ user, analytics, userProducts, savingProducts, depositProducts }) => {
        this.user = user;
        this.analytics = analytics;
        this.savingMode = localStorage.getItem(LS_SAVING_MODE) === 'true';
        this.monthlySaving = Math.min(
          Math.max(parseNumber(localStorage.getItem(LS_SAVING)) ?? DEFAULT_MONTHLY_SAVING, 0),
          MAX_MONTHLY_SAVING,
        );
        this.userProducts = userProducts;
        this.savingProducts = this.ensureExpoSavingProduct(savingProducts);
        this.depositProducts = depositProducts;
        this.initializeSimulationYears();
        this.rebuildChart();
        this.loading = false;
        setTimeout(() => {
          this.runEntryAnimations();
          this.animateSimAmount(this.displayTargetAmount + this.productGainTarget);
        }, 100);
      },
      error: (err) => {
        console.error('[Simulator] 데이터 로딩 실패:', err);
        this.loading = false;
      },
    });
  }

  private runEntryAnimations() {
    gsap.set('.page-header, .year-selector, .sim-hero, .insight-banner, .section-label, .chart-card, .product-card', {
      opacity: 0, y: 18,
    });
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.page-header',    { opacity: 1, y: 0, duration: 0.4 })
      .to('.year-selector',  { opacity: 1, y: 0, duration: 0.35 }, '-=0.2')
      .to('.sim-hero',       { opacity: 1, y: 0, duration: 0.5 }, '-=0.2')
      .to('.insight-banner', { opacity: 1, y: 0, duration: 0.35 }, '-=0.2')
      .to('.section-label',  { opacity: 1, y: 0, duration: 0.3, stagger: 0.06 }, '-=0.15')
      .to('.chart-card',     { opacity: 1, y: 0, duration: 0.4 }, '-=0.2')
      .to('.product-card',   { opacity: 1, y: 0, duration: 0.3, stagger: 0.08 }, '-=0.3');
  }

  private initializeSimulationYears() {
    const stored = parseNumber(localStorage.getItem(LS_YEARS));
    const fallback = DEFAULT_SIMULATION_YEARS;
    const nextYears = stored && this.yearOptions.includes(stored) ? stored : fallback;
    this.simulationYears = nextYears;
    localStorage.setItem(LS_YEARS, String(nextYears));
  }

  onToggle(active: boolean) {
    this.savingMode = active;
    localStorage.setItem(LS_SAVING_MODE, String(active));
    this.rebuildChart();
    this.animateSimAmount(this.displayTargetAmount + this.productGainTarget);
  }

  simulatedAmount(predIdx: number): number {
    if (!this.analytics) return 0;
    const p = this.analytics.predictions[predIdx];
    if (!p) return 0;
    return this.savingMode
      ? p.predicted_amount + this.monthlySaving * 12 * p.year
      : p.predicted_amount;
  }

  simulatedAmountByYear(year: number): number {
    if (!this.analytics) return 0;
    const p = this.analytics.predictions.find((pred) => pred.year === year);
    if (!p) return 0;
    return this.savingMode
      ? p.predicted_amount + this.monthlySaving * 12 * p.year
      : p.predicted_amount;
  }

  onMonthlySavingChange(rawValue: number | null) {
    const nextValue = rawValue ?? 0;
    this.monthlySaving = Math.min(Math.max(nextValue, 0), MAX_MONTHLY_SAVING);
    localStorage.setItem(LS_SAVING, String(this.monthlySaving));
    if (this.savingMode) {
      this.rebuildChart();
      this.animateSimAmount(this.displayTargetAmount + this.productGainTarget);
    }
  }

  onYearsChange(years: number) {
    this.simulationYears = years;
    localStorage.setItem(LS_YEARS, String(years));
    this.rebuildChart();
    this.animateSimAmount(this.displayTargetAmount + this.productGainTarget);
  }

  // ── 금융상품 모달 ─────────────────────────────────────────────────

  openProductModal() {
    this.showProductModal = true;
    this.selectedProduct = null;
    this.selectedOption = null;
    this.productSearchTerm = '';
  }

  closeProductModal() {
    this.showProductModal = false;
    this.selectedProduct = null;
    this.selectedOption = null;
    this.productSearchTerm = '';
  }

  onProductTabChange(tab: 'saving' | 'deposit') {
    this.productTab = tab;
    this.selectedProduct = null;
    this.productSearchTerm = '';
  }

  selectProduct(p: FssProduct) {
    this.selectedProduct = p;
    this.selectedOption = p.best_option;
  }

  addProduct() {
    if (!this.selectedProduct || !this.selectedOption) return;
    this.productLoading = true;
    this.productApi
      .addProduct({
        product_type: this.productTab,
        fin_prdt_nm: this.selectedProduct.fin_prdt_nm,
        kor_co_nm: this.selectedProduct.kor_co_nm,
        monthlyAmount: this.newMonthlyAmount,
        intrRate: this.selectedOption.intr_rate,
        saveTrm: this.selectedOption.save_trm,
        startDate: this.newStartDate,
      })
      .subscribe({
        next: (res) => {
          this.userProducts.push({
            id: res.id,
            user_id: this.user!.id,
            product_type: this.productTab,
            fin_prdt_nm: this.selectedProduct!.fin_prdt_nm,
            kor_co_nm: this.selectedProduct!.kor_co_nm,
            monthly_amount: this.newMonthlyAmount,
            intr_rate: this.selectedOption!.intr_rate,
            save_trm: this.selectedOption!.save_trm,
            start_date: this.newStartDate,
          });
          this.rebuildChart();
          this.animateSimAmount(this.displayTargetAmount + this.productGainTarget);
          this.productLoading = false;
          this.closeProductModal();
        },
        error: () => {
          this.productLoading = false;
        },
      });
  }

  removeProduct(id: number) {
    this.productApi.deleteProduct(id).subscribe(() => {
      this.userProducts = this.userProducts.filter((p) => p.id !== id);
      this.rebuildChart();
      this.animateSimAmount(this.displayTargetAmount + this.productGainTarget);
    });
  }

  get currentProducts(): FssProduct[] {
    return this.productTab === 'saving' ? this.savingProducts : this.depositProducts;
  }

  get filteredProducts(): FssProduct[] {
    const term = this.normalizeSearchText(this.productSearchTerm);
    if (!term) return this.currentProducts;
    return this.currentProducts.filter((product) => {
      const name = this.normalizeSearchText(product.fin_prdt_nm);
      const bank = this.normalizeSearchText(product.kor_co_nm);
      return name.includes(term) || bank.includes(term);
    });
  }

  private ensureExpoSavingProduct(products: FssProduct[]): FssProduct[] {
    const normalizedName = this.normalizeSearchText(EXPO_SAVING_NAME);
    const hasExpo = products.some(
      (product) => this.normalizeSearchText(product.fin_prdt_nm) === normalizedName,
    );
    if (hasExpo) return products;
    return [
      ...products,
      {
        fin_prdt_cd: EXPO_SAVING_CODE,
        fin_prdt_nm: EXPO_SAVING_NAME,
        kor_co_nm: EXPO_SAVING_BANK,
        join_member: '',
        etc_note: '',
        best_option: null,
        options: [],
      },
    ];
  }

  private normalizeSearchText(value: string): string {
    return value.toLowerCase().replace(/\s+/g, '');
  }

  // ── 차트 ──────────────────────────────────────────────────────────

  private predictedAmountByYear(year: number): number {
    if (!this.analytics) return 0;
    return (
      this.analytics.predictions.find((p) => p.year === year)?.predicted_amount ??
      this.analytics.predictions.at(-1)?.predicted_amount ??
      0
    );
  }

  rebuildChart() {
    if (!this.analytics || !this.user) return;
    const blue = this.cssVar('--blue', '#3182f6');
    const blueBg = this.cssVar('--blue-bg', 'rgba(49,130,246,0.12)');
    const green = this.cssVar('--green', '#03b26c');
    const greenBg = this.cssVar('--green-bg', 'rgba(3,178,108,0.12)');
    const yellow = '#f59e0b';
    const yellowBg = 'rgba(245,158,11,0.12)';
    const card = this.cssVar('--bg-card', '#ffffff');

    const selectedPredictions = this.analytics.predictions.filter(
      (p) => p.year <= this.simulationYears,
    );
    const basePoints = [
      this.user.total_assets,
      ...selectedPredictions.map((p) => p.predicted_amount),
    ];
    const savingPoints = [
      this.user.total_assets,
      ...selectedPredictions.map((p) => p.predicted_amount + this.monthlySaving * 12 * p.year),
    ];
    const productPoints = [
      this.user.total_assets,
      ...selectedPredictions.map(
        (p) =>
          (this.savingMode
            ? p.predicted_amount + this.monthlySaving * 12 * p.year
            : p.predicted_amount) + this.totalProductGainByYear(p.year),
      ),
    ];

    const hasProducts = this.userProducts.length > 0;

    this.lineData = {
      labels: ['현재', ...selectedPredictions.map((p) => `${p.year}년 후`)],
      datasets: [
        {
          data: hasProducts ? productPoints : this.savingMode ? savingPoints : basePoints,
          label: hasProducts ? '적금/예금 포함' : this.savingMode ? '절약 시나리오' : '현재 패턴',
          fill: true,
          tension: 0.42,
          borderColor: hasProducts ? yellow : this.savingMode ? green : blue,
          backgroundColor: hasProducts ? yellowBg : this.savingMode ? greenBg : blueBg,
          pointBackgroundColor: hasProducts ? yellow : this.savingMode ? green : blue,
          pointBorderColor: card,
          pointHoverBackgroundColor: card,
          pointHoverBorderColor: hasProducts ? yellow : this.savingMode ? green : blue,
          pointBorderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
          borderWidth: 3,
        },
        ...(hasProducts && this.savingMode
          ? [
              {
                data: savingPoints,
                label: '절약 시나리오',
                fill: true,
                tension: 0.42,
                borderColor: green,
                backgroundColor: greenBg,
                pointBackgroundColor: green,
                pointBorderColor: card,
                pointHoverBackgroundColor: card,
                pointHoverBorderColor: green,
                pointBorderWidth: 3,
                pointRadius: 5,
                pointHoverRadius: 7,
                borderWidth: 3,
              },
            ]
          : []),
        ...(!hasProducts && !this.savingMode
          ? []
          : hasProducts && !this.savingMode
            ? [
                {
                  data: basePoints,
                  label: '현재 패턴',
                  fill: false,
                  tension: 0.42,
                  borderColor: blue,
                  backgroundColor: blueBg,
                  pointBackgroundColor: blue,
                  pointBorderColor: card,
                  pointHoverBackgroundColor: card,
                  pointHoverBorderColor: blue,
                  pointBorderWidth: 2,
                  pointRadius: 4,
                  pointHoverRadius: 6,
                  borderWidth: 2,
                },
              ]
            : []),
      ],
    };
  }

  private cssVar(name: string, fallback: string): string {
    if (typeof document === 'undefined') return fallback;
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  }
}
