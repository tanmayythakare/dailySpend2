import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  get<T>(endpoint: string, options?: object): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, options);
  }

  post<T>(endpoint: string, body: any, options?: object): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, options);
  }

  patch<T>(endpoint: string, body: any, options?: object): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, body, options);
  }

  put<T>(endpoint: string, body: any, options?: object): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body, options);
  }

  delete<T>(endpoint: string, options?: object): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, options);
  }
}
