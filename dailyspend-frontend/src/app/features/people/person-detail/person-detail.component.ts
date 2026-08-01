import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PersonService } from '../../../core/services/person.service';
import { Person } from '../../../models/person.model';
import { Transaction } from '../../../models/transaction.model';

@Component({
  selector: 'app-person-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './person-detail.component.html',
  styleUrls: ['./person-detail.component.scss']
})
export class PersonDetailComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  person:       Person | null = null;
  transactions: Transaction[] = [];
  loading       = false;
  error         = '';

  constructor(
    private route:         ActivatedRoute,
    private personService: PersonService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPerson(id);
    this.loadTransactions(id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPerson(id: number): void {
    this.personService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  (person) => { this.person = person; },
        error: ()       => { this.error  = 'Failed to load person details.'; }
      });
  }

  private loadTransactions(id: number): void {
    this.loading = true;
    // Uses GET /api/v1/people/:id/transactions
    this.personService.getPersonTransactions(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (transactions) => {
          this.transactions = transactions;
          this.loading      = false;
        },
        error: () => { this.loading = false; }
      });
  }

  // MONEY_GIVEN = we gave them (increases what they owe us), MONEY_TAKEN = they gave us (decreases what they owe us)
  getBalance(): number {
    return this.transactions.reduce((sum, t) => {
      if (t.type === 'MONEY_GIVEN') return sum + (t.amount || 0);
      if (t.type === 'MONEY_TAKEN') return sum - (t.amount || 0);
      return sum;
    }, 0);
  }

  formatCurrency(value: number | undefined | null): string {
    if (value == null || value === 0) return '₹0.00';
    const abs = Math.abs(value);
    const fmt = abs.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return value < 0 ? `-₹${fmt}` : `+₹${fmt}`;
  }
}