export interface User {
  id: number;
  name: string;
  email: string;
  monthly_income: number;
  total_assets: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Transaction {
  id: number;
  user_id: number;
  date: string;
  time: string;
  category: Category;
  amount: number;
  description: string;
}

export interface AssetPrediction {
  year: number;
  predicted_amount: number;
}

export interface Analytics {
  user_id: number;
  consumption_type: string;
  impulse_ratio: number;
  total_spent_last_30_days: number;
  predictions: AssetPrediction[];
}

export interface Anomaly {
  id: number;
  date: string;
  time: string;
  category: Category;
  amount: number;
  description: string;
  reasons: string[];
}

export type Category = '식비' | '배달' | '카페' | '쇼핑' | '교통' | '구독 서비스' | '문화' | '미용' | '의료' | '기타';

export const CATEGORIES: readonly Category[] = [
  '식비',
  '배달',
  '카페',
  '쇼핑',
  '교통',
  '구독 서비스',
  '문화',
  '미용',
  '의료',
  '기타',
];

export interface FssProduct {
  fin_prdt_cd: string;
  fin_prdt_nm: string;
  kor_co_nm: string;
  join_member: string;
  etc_note: string;
  best_option: {
    intr_rate: number;
    intr_rate2: number;
    save_trm: number;
    rsrv_type_nm: string;
  } | null;
  options: {
    intr_rate: number;
    intr_rate2: number;
    save_trm: number;
    rsrv_type_nm: string;
  }[];
}

export interface UserFinancialProduct {
  id: number;
  user_id: number;
  product_type: 'saving' | 'deposit';
  fin_prdt_nm: string;
  kor_co_nm: string;
  monthly_amount: number;
  intr_rate: number;
  save_trm: number;
  start_date: string;
}

export interface CardEvent {
  merchant: string;
  category: Category;
  amount: number;
  date: string;
  time: string;
}

export const CATEGORY_COLORS: Record<Category, string> = {
  식비: '#3b82f6',
  배달: '#ef4444',
  카페: '#f59e0b',
  쇼핑: '#8b5cf6',
  교통: '#10b981',
  '구독 서비스': '#06b6d4',
  문화: '#f97316',
  미용: '#ec4899',
  의료: '#14b8a6',
  기타: '#8b95a1',
};
