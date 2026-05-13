import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction, Anomaly } from '../../../shared/model/types';
import { createAuthHeaders, getStoredUserId } from '../../../shared/model/auth.storage';

@Injectable({ providedIn: 'root' })
export class TransactionApi {
  private http = inject(HttpClient);
  private base = 'http://localhost:8000/api';

  getTransactions(userId: number | null = null): Observable<Transaction[]> {
    const resolvedUserId = userId ?? getStoredUserId();
    return this.http.get<Transaction[]>(`${this.base}/transactions/${resolvedUserId}`, {
      headers: createAuthHeaders(),
    });
  }

  getAnomalies(userId: number | null = null): Observable<Anomaly[]> {
    const resolvedUserId = userId ?? getStoredUserId();
    return this.http.get<Anomaly[]>(`${this.base}/user/${resolvedUserId}/anomalies`, {
      headers: createAuthHeaders(),
    });
  }
}
