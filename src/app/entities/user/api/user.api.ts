import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../../shared/model/types';
import { createAuthHeaders, getStoredUserId, saveAuth, getAuthToken } from '../../../shared/model/auth.storage';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserApi {
  private http = inject(HttpClient);
  private base = environment.apiBase;

  getUser(id: number | null = null): Observable<User> {
    const userId = id ?? getStoredUserId();
    return this.http.get<User>(`${this.base}/user/${userId}`, {
      headers: createAuthHeaders(),
    });
  }

  updateUser(payload: User): Observable<User> {
    return new Observable<User>((observer) => {
      const sub = this.http
        .put<User>(`${this.base}/user/${payload.id}`, payload, { headers: createAuthHeaders() })
        .subscribe({
          next: (user) => {
            const token = getAuthToken();
            if (token) saveAuth(token, user);
            observer.next(user);
            observer.complete();
          },
          error: (err) => observer.error(err),
        });
      return () => sub.unsubscribe();
    });
  }
}
