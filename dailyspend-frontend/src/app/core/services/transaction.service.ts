import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Transaction,
  ExpenseRequest,
  MoneyGivenRequest,
  MoneyTakenRequest,
  IncomeRequest
} from '../../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = `${environment.apiBaseUrl}/v1/transactions`;

  constructor(private http: HttpClient) {}

  // ── Simple list (no pagination) ──────────────────────────────────────────
  getAll(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiUrl);
  }

  // ── Single transaction by ID (used by transaction-form edit mode) ────────
  getTransactionById(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  // ── Paged + filtered (used by transaction-list) ──────────────────────────
  getPaged(params: any): Observable<any> {
    let httpParams = new HttpParams();

    Object.keys(params).forEach(key => {
      if (params[key] != null && params[key] !== '') {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });

    return this.http.get<any>(`${this.apiUrl}/filter`, { params: httpParams });
  }

  // ── Used by reports (page=0, size=1000 means "get all") ─────────────────
  getTransactions(page: number = 0, size: number = 1000): Observable<any> {
    return this.getPaged({ page, size });
  }

  // ── Semantic create methods ──────────────────────────────────────────────
  createExpense(request: ExpenseRequest): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/expense`, request);
  }

  createIncome(request: IncomeRequest): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/income`, request);
  }

  createMoneyGiven(request: MoneyGivenRequest): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/money-given`, request);
  }

  createMoneyTaken(request: MoneyTakenRequest): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/money-taken`, request);
  }

  // ── Generic createTransaction used by transaction-form ───────────────────
  // Routes to the correct semantic endpoint based on the type field.
  createTransaction(payload: any): Observable<Transaction> {
    switch (payload.type) {
      case 'MONEY_GIVEN':
        return this.http.post<Transaction>(`${this.apiUrl}/money-given`, {
          accountId: payload.accountId,
          personId: payload.personId,
          amount: payload.amount,
          description: payload.description,
          transactionDate: payload.transactionDate
        });

      case 'MONEY_TAKEN':
        return this.http.post<Transaction>(`${this.apiUrl}/money-taken`, {
          accountId: payload.accountId,
          personId: payload.personId,
          amount: payload.amount,
          description: payload.description,
          transactionDate: payload.transactionDate
        });

      case 'INCOME':
        return this.http.post<Transaction>(`${this.apiUrl}/income`, {
          accountId: payload.accountId,
          categoryId: payload.categoryId ?? null,
          amount: payload.amount,
          description: payload.description,
          transactionDate: payload.transactionDate
        });

      case 'EXPENSE':
      default:
        return this.http.post<Transaction>(`${this.apiUrl}/expense`, {
          accountId: payload.accountId,
          categoryId: payload.categoryId ?? null,
          personId: payload.personId ?? null,
          amount: payload.amount,
          description: payload.description,
          transactionDate: payload.transactionDate
        });
    }
  }

  // ── Update ───────────────────────────────────────────────────────────────
  updateTransaction(id: number, payload: any): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/${id}`, payload);
  }

  // ── Delete ───────────────────────────────────────────────────────────────
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ── Batch Transactions ───────────────────────────────────────────────────
  createBatchTransactions(requests: any[]): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/batch`, requests);
  }
}