import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Person, PersonBalanceDto } from '../../models/person.model';
import { Transaction } from '../../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class PersonService {

  constructor(private api: ApiService) {}

  // GET /api/v1/people — returns { id, name } only
  getAll(): Observable<Person[]> {
    return this.api.get<Person[]>('/v1/people');
  }

  // GET /api/v1/people/:id
  getById(id: number): Observable<Person> {
    return this.api.get<Person>(`/v1/people/${id}`);
  }

  // GET /api/v1/people/with-balances — returns { id, name, balance, createdAt }
  getAllWithBalances(): Observable<PersonBalanceDto[]> {
    return this.api.get<PersonBalanceDto[]>('/v1/people/with-balances');
  }

  // GET /api/v1/people/:id/transactions
  getPersonTransactions(id: number): Observable<Transaction[]> {
    return this.api.get<Transaction[]>(`/v1/people/${id}/transactions`);
  }

  create(payload: { name: string }): Observable<Person> {
    return this.api.post<Person>('/v1/people', payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/v1/people/${id}`);
  }

  getQrPayload(id: number): Observable<any> {
    return this.api.get<any>(`/v1/people/${id}/qr-payload`);
  }

  // Aliases for compatibility
  getAllPeople(): Observable<Person[]> { return this.getAll(); }
  createPerson(payload: { name: string }): Observable<Person> { return this.create(payload); }
  deletePerson(id: number): Observable<void> { return this.delete(id); }
}