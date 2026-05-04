import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Analytics } from '../../../shared/model/types';

@Injectable({ providedIn: 'root' })
export class AnalyticsApi {
  private http = inject(HttpClient);
  private base = 'http://localhost:8000/api';

  getAnalytics(userId = 1): Observable<Analytics> {
    return this.http.get<Analytics>(`${this.base}/user/${userId}/analytics`);
  }
}
