import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface HelpTourStep {
  route: string;
  targetId: string;
  title: string;
  description: string;
}

const HELP_TOUR_STEPS: HelpTourStep[] = [
  {
    route: '/dashboard',
    targetId: 'dashboard-asset',
    title: '현재 자산 요약',
    description:
      '현재 보유 자산과 이번 달 저축 가능 금액을 한눈에 확인하는 홈 화면의 핵심 카드예요.',
  },
  {
    route: '/dashboard',
    targetId: 'dashboard-summary',
    title: '소비 핵심 지표',
    description:
      '최근 30일 소비 금액과 충동 소비 지수를 함께 보여줘서 소비 흐름을 빠르게 파악할 수 있어요.',
  },
  {
    route: '/dashboard',
    targetId: 'dashboard-anomalies',
    title: 'AI 이상 탐지',
    description:
      '평소 패턴과 다른 지출이 발견되면 경고로 보여줘요. 놓치기 쉬운 소비를 점검할 때 사용하세요.',
  },
  {
    route: '/dashboard',
    targetId: 'dashboard-recent',
    title: '최근 지출',
    description:
      '가장 최근 지출 내역을 바로 확인하고, 금액과 카테고리 흐름을 빠르게 훑어볼 수 있어요.',
  },
  {
    route: '/analytics',
    targetId: 'analytics-chips',
    title: 'AI 소비 요약',
    description:
      '소비 유형, 충동 비율, 최근 지출, 카테고리 수를 요약해서 보여주는 분석 첫 영역이에요.',
  },
  {
    route: '/analytics',
    targetId: 'analytics-categories',
    title: '카테고리별 지출',
    description: '어떤 카테고리에 가장 많이 썼는지 금액과 비율 막대로 비교할 수 있어요.',
  },
  {
    route: '/analytics',
    targetId: 'analytics-doughnut',
    title: '비중 차트',
    description: '전체 지출에서 각 카테고리가 차지하는 비중을 도넛 차트로 확인하는 영역이에요.',
  },
  {
    route: '/analytics',
    targetId: 'analytics-monthly',
    title: '월별 지출 추이',
    description:
      '최근 월별 지출 흐름과 전월 대비 변화를 확인해 소비가 늘었는지 줄었는지 볼 수 있어요.',
  },
  {
    route: '/transactions',
    targetId: 'transactions-filter',
    title: '카테고리 필터',
    description: '전체 내역 중 보고 싶은 카테고리만 골라 지출 내역을 좁혀볼 수 있어요.',
  },
  {
    route: '/transactions',
    targetId: 'transactions-summary',
    title: '선택 내역 요약',
    description: '현재 선택된 필터의 거래 건수와 총 지출 금액을 바로 보여줘요.',
  },
  {
    route: '/transactions',
    targetId: 'transactions-list',
    title: '거래 리스트',
    description: '날짜, 시간, 카테고리, 금액을 기준으로 실제 지출 내역을 확인하는 영역이에요.',
  },
  {
    route: '/transactions',
    targetId: 'transactions-more',
    title: '더 보기',
    description: '내역이 많을 때 추가 거래를 단계적으로 불러와 화면을 깔끔하게 유지해요.',
  },
  {
    route: '/simulator',
    targetId: 'simulator-years',
    title: '시뮬레이션 기간',
    description: '예측 기간을 선택하면 해당 기간 기준으로 자산·저축 효과·차트가 모두 갱신돼요.',
  },
  {
    route: '/simulator',
    targetId: 'simulator-hero',
    title: '예상 자산',
    description: '현재 소비 패턴이나 절약 시나리오를 기준으로 선택한 기간 뒤 예상 자산을 보여줘요.',
  },
  {
    route: '/simulator',
    targetId: 'simulator-toggle',
    title: '절약 시나리오',
    description: '토글을 켜면 매월 추가 저축을 반영해서 예상 자산과 차트가 다시 계산돼요.',
  },
  {
    route: '/simulator',
    targetId: 'simulator-impact',
    title: '저축 효과',
    description: '매월 추가 저축과 선택한 기간 누적 차이를 숫자로 확인할 수 있어요.',
  },
  {
    route: '/simulator',
    targetId: 'simulator-pension',
    title: '국민연금 추정',
    description:
      '월 수입 기준 국민연금 납부액과 선택한 기간 납부 후 예상 월 수령액을 추정해서 보여줘요. 해당 없으면 토글로 끌 수 있어요.',
  },
  {
    route: '/simulator',
    targetId: 'simulator-products',
    title: '적금·예금 상품',
    description:
      '금감원 공식 데이터에서 실제 은행 적금·예금 상품을 선택해 등록하면 만기 수령액이 자산 예측에 자동으로 반영돼요.',
  },
  {
    route: '/simulator',
    targetId: 'simulator-chart',
    title: '자산 성장 곡선',
    description:
      '현재 패턴과 절약 시나리오, 적금·예금 포함 시나리오의 자산 성장 흐름을 선 차트로 비교해요.',
  },
];

@Injectable({ providedIn: 'root' })
export class HelpTourService {
  private readonly router = inject(Router);

  readonly active = signal(false);
  readonly steps = signal<HelpTourStep[]>([]);
  readonly index = signal(0);
  readonly currentStep = computed(() => this.steps()[this.index()] ?? null);

  startForCurrentRoute(): void {
    const route = this.normalizeRoute(this.router.url);
    const pageSteps = HELP_TOUR_STEPS.filter((step) => step.route === route);
    if (pageSteps.length === 0) return;

    this.steps.set(pageSteps);
    this.index.set(0);
    this.active.set(true);
  }

  close(): void {
    this.active.set(false);
    this.steps.set([]);
    this.index.set(0);
  }

  async next(): Promise<void> {
    const nextIndex = this.index() + 1;
    if (nextIndex >= this.steps().length) {
      this.close();
      return;
    }

    await this.goToIndex(nextIndex);
  }

  async previous(): Promise<void> {
    const previousIndex = this.index() - 1;
    if (previousIndex < 0) return;

    await this.goToIndex(previousIndex);
  }

  async skipMissingTarget(): Promise<void> {
    if (!this.active()) return;
    await this.next();
  }

  isLastStep(): boolean {
    return this.index() === this.steps().length - 1;
  }

  private async goToIndex(index: number): Promise<void> {
    const step = this.steps()[index];
    if (!step) {
      this.close();
      return;
    }

    this.index.set(index);
    if (this.normalizeRoute(this.router.url) !== step.route) {
      await this.router.navigateByUrl(step.route);
    }
  }

  private normalizeRoute(url: string): string {
    const path = url.split('?')[0].split('#')[0];
    return path === '/' ? '/dashboard' : path;
  }
}
