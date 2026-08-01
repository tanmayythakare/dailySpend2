import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { RecurringTransactionService, RecurringTransaction } from '../../core/services/recurring-transaction.service';
import { SHARED_IMPORTS } from '../../shared/shared.imports';

export interface UIRecurringTransaction extends RecurringTransaction {
  formattedAmount?: string;
}

@Component({
  selector: 'app-schedules',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.scss']
})
export class SchedulesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  loading = false;
  schedules: UIRecurringTransaction[] = [];
  errorMessage = '';

  totalActiveCount = 0;
  monthlyCommitment = 0;

  constructor(private recurringService: RecurringTransactionService) {}

  ngOnInit(): void {
    this.loadSchedules();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSchedules(): void {
    this.loading = true;
    this.errorMessage = '';
    this.recurringService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.schedules = data.map(s => ({
            ...s,
            formattedAmount: this.formatCurrency(s.amount)
          }));
          this.calculateStats();
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = 'Failed to load recurring schedules';
          this.loading = false;
        }
      });
  }

  calculateStats(): void {
    const active = this.schedules.filter(s => s.status === 'ACTIVE');
    this.totalActiveCount = active.length;

    this.monthlyCommitment = active.reduce((sum, s) => {
      let monthlyEquivalent = 0;
      switch (s.frequency) {
        case 'DAILY':
          monthlyEquivalent = s.amount * 30;
          break;
        case 'WEEKLY':
          monthlyEquivalent = s.amount * 4.33;
          break;
        case 'MONTHLY':
          monthlyEquivalent = s.amount;
          break;
        case 'QUARTERLY':
          monthlyEquivalent = s.amount / 3;
          break;
        case 'YEARLY':
          monthlyEquivalent = s.amount / 12;
          break;
      }
      return sum + monthlyEquivalent;
    }, 0);
  }

  toggleStatus(schedule: UIRecurringTransaction): void {
    if (!schedule.id || !schedule.status) return;

    const newStatus = schedule.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    schedule.status = newStatus; // optimistic UI update

    this.recurringService.updateStatus(schedule.id, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          schedule.status = updated.status;
          schedule.nextExecutionDate = updated.nextExecutionDate;
          this.calculateStats();
        },
        error: () => {
          this.errorMessage = 'Failed to update schedule status';
          // revert on error
          schedule.status = schedule.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
          this.calculateStats();
        }
      });
  }

  deleteSchedule(id?: number): void {
    if (!id) return;

    if (confirm('Are you sure you want to delete this schedule? Logged transactions will not be deleted.')) {
      this.recurringService.delete(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.schedules = this.schedules.filter(s => s.id !== id);
            this.calculateStats();
          },
          error: () => {
            this.errorMessage = 'Failed to delete schedule';
          }
        });
    }
  }

  trackByFn(index: number, item: UIRecurringTransaction): number | undefined {
    return item.id;
  }

  formatCurrency(value: number): string {
    if (value === undefined || value === null) return '₹0.00';
    return `₹${value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
}
