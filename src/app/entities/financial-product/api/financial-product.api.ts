import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FssProduct, UserFinancialProduct } from '../../../shared/model/types';
import { createAuthHeaders, getStoredUserId } from '../../../shared/model/auth.storage';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FinancialProductApi {
  private http = inject(HttpClient);
  private base = environment.apiBase;

  getSavingProducts(): Observable<FssProduct[]> {
    return this.http.get<FssProduct[]>(`${this.base}/fss/saving-products`);
  }

  getDepositProducts(): Observable<FssProduct[]> {
    return this.http.get<FssProduct[]>(`${this.base}/fss/deposit-products`);
  }

  getUserProducts(): Observable<UserFinancialProduct[]> {
    const userId = getStoredUserId();
    return this.http.get<UserFinancialProduct[]>(
      `${this.base}/user/${userId}/financial-products`,
      { headers: createAuthHeaders() }
    );
  }

  addProduct(body: {
    product_type: string;
    fin_prdt_nm: string;
    kor_co_nm: string;
    monthlyAmount: number;
    intrRate: number;
    saveTrm: number;
    startDate: string;
  }): Observable<{ id: number }> {
    const userId = getStoredUserId();
    return this.http.post<{ id: number }>(
      `${this.base}/user/${userId}/financial-products`,
      body,
      { headers: createAuthHeaders() }
    );
  }

  deleteProduct(productId: number): Observable<{ ok: boolean }> {
    const userId = getStoredUserId();
    return this.http.delete<{ ok: boolean }>(
      `${this.base}/user/${userId}/financial-products/${productId}`,
      { headers: createAuthHeaders() }
    );
  }
}
