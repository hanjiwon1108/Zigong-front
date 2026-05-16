import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Analytics } from '../../../shared/model/types';
import { createAuthHeaders, getStoredUserId } from '../../../shared/model/auth.storage';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnalyticsApi {
  private http = inject(HttpClient);
  private base = environment.apiBase;

  getAnalytics(userId: number | null = null): Observable<Analytics> {
    const resolvedUserId = userId ?? getStoredUserId();
    return this.http.get<Analytics>(`${this.base}/user/${resolvedUserId}/analytics`, {
      headers: createAuthHeaders(),
    });
  }
}
