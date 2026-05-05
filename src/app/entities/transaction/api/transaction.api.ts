import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction, Anomaly } from '../../../shared/model/types';

@Injectable({ providedIn: 'root' })
export class TransactionApi {
  private http = inject(HttpClient);
  private base = 'http://localhost:8000/api';

  getTransactions(userId = 1): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.base}/transactions/${userId}`);
  }

  getAnomalies(userId = 1): Observable<Anomaly[]> {
    return this.http.get<Anomaly[]>(`${this.base}/user/${userId}/anomalies`);
  }
}
