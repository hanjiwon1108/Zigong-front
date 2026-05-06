import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../../shared/model/types';

@Injectable({ providedIn: 'root' })
export class UserApi {
  private http = inject(HttpClient);
  private base = 'http://localhost:8000/api';

  getUser(id = 1): Observable<User> {
    return this.http.get<User>(`${this.base}/user/${id}`);
  }
}
