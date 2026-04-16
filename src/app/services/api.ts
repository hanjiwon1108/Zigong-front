import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Api {
  private baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  getUser(userId: number = 1): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/${userId}`);
  }

  getAnalytics(userId: number = 1): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/${userId}/analytics`);
  }

  getTransactions(userId: number = 1): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/transactions/${userId}`);
  }

  getAnomalies(userId: number = 1): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/user/${userId}/anomalies`);
  }
}
