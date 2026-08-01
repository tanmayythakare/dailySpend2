import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RecurringTransaction {
  id?: number;
  amount: number;
  type: 'EXPENSE' | 'INCOME';
  description: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  startDate: string;
  endDate?: string;
  nextExecutionDate?: string;
  status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  accountId: number;
  accountName?: string;
  categoryId?: number;
  categoryName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecurringTransactionService {
  private apiUrl = `${environment.apiBaseUrl}/v1/recurring-transactions`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<RecurringTransaction[]> {
    return this.http.get<RecurringTransaction[]>(this.apiUrl);
  }

  getById(id: number): Observable<RecurringTransaction> {
    return this.http.get<RecurringTransaction>(`${this.apiUrl}/${id}`);
  }

  create(payload: any): Observable<RecurringTransaction> {
    return this.http.post<RecurringTransaction>(this.apiUrl, payload);
  }

  updateStatus(id: number, status: string): Observable<RecurringTransaction> {
    let params = new HttpParams().set('status', status);
    return this.http.patch<RecurringTransaction>(`${this.apiUrl}/${id}/status`, null, { params });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
