import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { TransactionService } from '../../../core/services/transaction.service';
import { AccountService } from '../../../core/services/account.service';
import { CategoryService } from '../../../core/services/category.service';
import { PersonService } from '../../../core/services/person.service';
import { RecurringTransactionService } from '../../../core/services/recurring-transaction.service';
import { SHARED_IMPORTS } from '../../../shared/shared.imports';

interface TransactionFormData {
  type: string;
  accountId: number | null;
  categoryId: number | null;
  amount: number | null;
  personId: number | null;
  transactionDate: string;
  description: string;
}

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.scss']
})
export class TransactionFormComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  isEditMode = false;
  transactionId: number | null = null;
  loading = false;
  errorMessage = '';
  successMessage = '';

  isRecurring = false;
  recurringFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' = 'MONTHLY';
  recurringEndDate: string = '';

  transactionData: TransactionFormData = {
    type: 'EXPENSE',
    accountId: null,
    categoryId: null,
    amount: null,
    personId: null,
    transactionDate: this.getTodayDate(),
    description: ''
  };

  accounts: any[] = [];
  categories: any[] = [];
  people: any[] = [];

  accountOptions: { label: string; value: any }[] = [];
  categoryOptions: { label: string; value: any }[] = [];
  personOptions: { label: string; value: any }[] = [];

  get filteredCategoryOptions(): { label: string; value: any }[] {
    const targetType = this.transactionData.type === 'INCOME' ? 'INCOME' : 'EXPENSE';
    return this.categories
      .filter(c => c.type === targetType)
      .map(c => ({
        label: c.name,
        value: c.id
      }));
  }

  get categoryLabel(): string {
    return this.transactionData.type === 'INCOME'
      ? 'Income Source (Optional)'
      : 'Category (Optional)';
  }

  constructor(
    private transactionService: TransactionService,
    private accountService: AccountService,
    private categoryService: CategoryService,
    private personService: PersonService,
    private recurringTransactionService: RecurringTransactionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.transactionId = +id;
      this.loadTransaction(this.transactionId);
    }

    this.accountService.getAllAccounts()
      .pipe(takeUntil(this.destroy$))
      .subscribe(accounts => {
        this.accounts = accounts;
        this.accountOptions = accounts.map(a => ({
          label: `${a.name} (${this.formatCurrency(a.balance ?? 0)})`,
          value: a.id
        }));
      });

    this.categoryService.getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(categories => {
        this.categories = categories;
        this.categoryOptions = categories.map(c => ({
          label: c.name,
          value: c.id
        }));
      });

    this.personService.getAllPeople()
      .pipe(takeUntil(this.destroy$))
      .subscribe(people => {
        this.people = people;
        this.personOptions = people.map(p => ({
          label: p.name,
          value: p.id
        }));
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  loadTransaction(id: number): void {
    this.loading = true;

    this.transactionService.getTransactionById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tx: any) => {
          this.transactionData = {
            type: tx.type,
            accountId: tx.account?.id ?? null,
            categoryId: tx.category?.id ?? null,
            amount: tx.amount,
            personId: tx.person?.id ?? null,
            transactionDate: tx.transactionDate,
            description: tx.description || ''
          };
          this.loading = false;
        },
        error: () => {
          this.errorMessage = 'Failed to load transaction';
          this.loading = false;
        }
      });
  }

  selectType(type: string): void {
    this.transactionData.type = type;
    if (type === 'EXPENSE' || type === 'INCOME') {
      this.transactionData.personId = null;
    } else {
      this.transactionData.categoryId = null;
    }
  }

  isFormValid(): boolean {
    const hasAccount = !!this.transactionData.accountId;
    const hasAmount = this.transactionData.amount !== null && this.transactionData.amount > 0;
    const hasDate = !!this.transactionData.transactionDate;
    const hasRequiredPerson =
      this.transactionData.type === 'EXPENSE' ||
      this.transactionData.type === 'INCOME' ||
      !!this.transactionData.personId;

    return hasAccount && hasAmount && hasDate && hasRequiredPerson;
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.isRecurring && !this.isEditMode) {
      const payload = {
        amount: this.transactionData.amount,
        type: this.transactionData.type,
        description: this.transactionData.description || 'Recurring ' + this.transactionData.type.toLowerCase(),
        frequency: this.recurringFrequency,
        startDate: this.transactionData.transactionDate,
        endDate: this.recurringEndDate || null,
        accountId: this.transactionData.accountId,
        categoryId: this.transactionData.categoryId ?? null
      };

      this.recurringTransactionService.create(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.successMessage = 'Recurring schedule created successfully!';
            setTimeout(() => {
              if (!this.destroy$.closed) {
                this.router.navigate(['/transactions']);
              }
            }, 1200);
          },
          error: (err) => {
            this.errorMessage = err?.error?.message || 'Operation failed';
            this.loading = false;
          }
        });
    } else {
      const payload = {
        type: this.transactionData.type,
        accountId: this.transactionData.accountId,
        amount: this.transactionData.amount,
        categoryId: this.transactionData.categoryId ?? null,
        personId: this.transactionData.personId ?? null,
        transactionDate: this.transactionData.transactionDate,
        description: this.transactionData.description || null
      };

      const request$ = this.isEditMode && this.transactionId
        ? this.transactionService.updateTransaction(this.transactionId, payload)
        : this.transactionService.createTransaction(payload);

      request$
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.successMessage = this.isEditMode
              ? 'Transaction updated successfully!'
              : 'Transaction created successfully!';

            setTimeout(() => {
              if (!this.destroy$.closed) {
                this.router.navigate(['/transactions']);
              }
            }, 1200);
          },
          error: (err) => {
            this.errorMessage = err?.error?.message || 'Operation failed';
            this.loading = false;
          }
        });
    }
  }

  formatCurrency(value: number): string {
    if (value === undefined || value === null) return '₹0.00';
    return `₹${Math.abs(value).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
}
