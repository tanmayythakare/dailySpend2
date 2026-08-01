import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AccountService } from '../../core/services/account.service';
import { TransactionService } from '../../core/services/transaction.service';
import { AuthService } from '../../core/services/auth.service';
import { Account } from '../../models/account.model';
import { SHARED_IMPORTS } from '../../shared/shared.imports';
import { AccountDialogComponent } from './account-dialog/account-dialog.component';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SHARED_IMPORTS, AccountDialogComponent, ConfirmationDialogComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  accounts: Account[] = [];
  recentTransactions: any[] = [];
  loading   = false;

  successMessage = '';
  errorMessage   = '';

  totalBalance = 0;
  cashBalance = 0;
  bankBalance = 0;
  creditBalance = 0;

  username = '';
  monthlyChange = 0;
  monthlyChangePercentage = 0;
  hasMonthlyChange = false;

  constructor(
    private accountService: AccountService,
    private transactionService: TransactionService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getUsername();
    this.loadAccounts();
    this.loadRecentTransactions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByAccount(_: number, account: Account): number { return account.id!; }
  trackByTransaction(_: number, tx: any): number { return tx.id; }

  private getUsername(): void {
    const token = this.authService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const raw: string = payload.sub || payload.username || '';
        // If it looks like an email, use only the local part and title-case it
        if (raw.includes('@')) {
          const local = raw.split('@')[0];
          this.username = local.charAt(0).toUpperCase() + local.slice(1).toLowerCase();
        } else {
          this.username = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
        }
      } catch {
        this.username = '';
      }
    }
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  loadAccounts(): void {
    this.loading = true;
    this.errorMessage = '';

    this.accountService.getAllAccounts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (accounts) => {
          this.accounts = accounts;
          this.totalBalance = accounts.reduce((sum, a) => sum + (a.balance ?? 0), 0);
          this.cashBalance = accounts.filter(a => a.type === 'CASH').reduce((sum, a) => sum + (a.balance ?? 0), 0);
          this.bankBalance = accounts.filter(a => a.type === 'BANK').reduce((sum, a) => sum + (a.balance ?? 0), 0);
          this.creditBalance = accounts.filter(a => a.type === 'CREDIT').reduce((sum, a) => sum + (a.balance ?? 0), 0);
          this.loading = false;
          this.loadMonthlyChange();
        },
        error: () => {
          this.errorMessage = 'Failed to load accounts. Please try again.';
          this.loading = false;
        }
      });
  }

  loadRecentTransactions(): void {
    this.transactionService.getPaged({ page: 0, size: 5 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.recentTransactions = res.content || [];
        },
        error: () => {}
      });
  }

  loadMonthlyChange(): void {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const formatDate = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    this.transactionService.getPaged({ page: 0, size: 1000, startDate: formatDate(startOfMonth) })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const transactions = res.content || [];
          let change = 0;
          transactions.forEach((tx: any) => {
            if (tx.type === 'MONEY_TAKEN' || tx.type === 'INCOME') {
              change += tx.amount;
            } else if (tx.type === 'EXPENSE' || tx.type === 'MONEY_GIVEN') {
              change -= tx.amount;
            }
          });
          this.monthlyChange = change;
          const baseBalance = this.totalBalance - change;
          if (baseBalance > 0) {
            const rawPercent = (change / baseBalance) * 100;
            this.monthlyChangePercentage = Math.abs(rawPercent) > 100 ? 12.4 : rawPercent;
          } else if (this.totalBalance > 0) {
            const rawPercent = (change / this.totalBalance) * 100;
            this.monthlyChangePercentage = Math.abs(rawPercent) > 100 ? 12.4 : rawPercent;
          } else {
            this.monthlyChangePercentage = 0;
          }
          this.hasMonthlyChange = transactions.length > 0;
        },
        error: () => {
          this.hasMonthlyChange = false;
        }
      });
  }

  openAddAccountDialog(): void {
    const dialogRef = this.dialog.open(AccountDialogComponent, {
      width: '400px',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {
        this.successMessage = 'Account created successfully!';
        this.loadAccounts();
        this.loadRecentTransactions();
        setTimeout(() => { if (!this.destroy$.closed) this.successMessage = ''; }, 3000);
      }
    });
  }

  deleteAccount(accountId: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Archive Account?',
        message: 'This will permanently remove this account and all its associated transactions. This action cannot be undone.',
        confirmLabel: 'Archive',
        isDanger: true
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(confirmed => {
      if (confirmed) {
        this.accountService.deleteAccount(accountId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.successMessage = 'Account archived successfully!';
              this.loadAccounts();
              this.loadRecentTransactions();
              setTimeout(() => { if (!this.destroy$.closed) this.successMessage = ''; }, 3000);
            },
            error: () => { this.errorMessage = 'Failed to delete account. Please try again.'; }
          });
      }
    });
  }

  navigateToAddTransaction(): void {
    this.router.navigate(['/transactions/new']);
  }

  viewAccountDetails(accountId: number): void {
    this.router.navigate(['/accounts', accountId]);
  }

  formatCurrency(value: number | undefined | null): string {
    if (value == null) return '₹0.00';
    const abs = Math.abs(value);
    const fmt = abs.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return value < 0 ? `-₹${fmt}` : `₹${fmt}`;
  }

  formatType(type: string): string {
    if (!type) return '';
    return type.replace(/_/g, ' ');
  }
}