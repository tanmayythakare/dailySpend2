import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TransactionService } from '../../../core/services/transaction.service';
import { AccountService } from '../../../core/services/account.service';
import { CategoryService } from '../../../core/services/category.service';
import { PersonService } from '../../../core/services/person.service';
import { Transaction } from '../../../models/transaction.model';
import { Account } from '../../../models/account.model';
import { Category } from '../../../models/category.model';
import { Person } from '../../../models/person.model';
import { SHARED_IMPORTS } from '../../../shared/shared.imports';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [SHARED_IMPORTS, ConfirmationDialogComponent],
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss']
})
export class TransactionListComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  transactions: Transaction[] = [];
  accounts:     Account[]     = [];
  categories:   Category[]    = [];
  people:       Person[]      = [];

  loading = true;
  Math    = Math;  // Expose for template

  // Pagination
  totalItems = 0;
  pageSize   = 10;
  pageIndex  = 0;
  get currentPage(): number { return this.pageIndex + 1; }
  get totalPages(): number  { return Math.ceil(this.totalItems / this.pageSize) || 1; }

  getPaginationSummary(): string {
    if (this.totalPages <= 1) {
      return `${this.totalItems} transaction${this.totalItems !== 1 ? 's' : ''}`;
    }
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.totalItems);
    return `Showing ${start} to ${end} of ${this.totalItems} transactions`;
  }

  // Single filter source of truth
  filters = { type: '', accountId: '', fromDate: '', toDate: '' };
  showFilters = false;

  // Search
  searchTerm = '';
  private searchSubject = new Subject<string>();

  // Reactive form for sort only
  filterForm: FormGroup;

  typeOptions = [
    { label: 'All Types', value: '' },
    { label: 'Expense', value: 'EXPENSE' },
    { label: 'Income', value: 'INCOME' },
    { label: 'Money Given', value: 'MONEY_GIVEN' },
    { label: 'Money Taken', value: 'MONEY_TAKEN' }
  ];

  sortOptions = [
    { label: 'Newest First', value: 'DATE_DESC' },
    { label: 'Oldest First', value: 'DATE_ASC' },
    { label: 'Amount: High to Low', value: 'AMOUNT_DESC' },
    { label: 'Amount: Low to High', value: 'AMOUNT_ASC' }
  ];

  editingId: number | null = null;
  editData:  any           = {};
  accountOptions: { label: string; value: any }[] = [];

  get filteredTransactions(): Transaction[] {
    if (!this.searchTerm.trim()) {
      return this.transactions;
    }
    const term = this.searchTerm.toLowerCase().trim();
    return this.transactions.filter(tx => 
      (tx.description && tx.description.toLowerCase().includes(term)) ||
      (tx.category && tx.category.name.toLowerCase().includes(term)) ||
      (tx.account && tx.account.name.toLowerCase().includes(term))
    );
  }

  constructor(
    private transactionService: TransactionService,
    private accountService:     AccountService,
    private categoryService:    CategoryService,
    private personService:      PersonService,
    private dialog:             MatDialog,
    private fb:                 FormBuilder,
    private snackBar:           MatSnackBar,
    private router:             Router
  ) {
    this.filterForm = this.fb.group({ sortOption: ['DATE_DESC'] });
  }

  ngOnInit(): void {
    this.loadDropdownData();
    this.loadTransactions();

    this.filterForm.get('sortOption')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => { this.pageIndex = 0; this.loadTransactions(); });

    this.searchSubject.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.searchTerm = term;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDropdownData(): void {
    this.accountService.getAll().pipe(takeUntil(this.destroy$)).subscribe(a => {
      this.accounts = a;
      this.accountOptions = [
        { label: 'All Accounts', value: '' },
        ...a.map(acc => ({ label: acc.name, value: acc.id }))
      ];
    });
    this.categoryService.getAll().pipe(takeUntil(this.destroy$)).subscribe(c => this.categories = c);
    this.personService.getAll().pipe(takeUntil(this.destroy$)).subscribe(p => this.people = p);
  }

  loadTransactions(): void {
    this.loading = true;

    const sortOption = this.filterForm.get('sortOption')!.value;
    let sortBy = 'transactionDate', direction = 'desc';
    if (sortOption === 'DATE_ASC')    { direction = 'asc'; }
    if (sortOption === 'AMOUNT_DESC') { sortBy = 'amount'; direction = 'desc'; }
    if (sortOption === 'AMOUNT_ASC')  { sortBy = 'amount'; direction = 'asc'; }

    const params: any = { page: this.pageIndex, size: this.pageSize, sortBy, direction };
    if (this.filters.type)      params.type      = this.filters.type;
    if (this.filters.accountId) params.accountId = this.filters.accountId;
    if (this.filters.fromDate)  params.startDate = this.filters.fromDate;
    if (this.filters.toDate)    params.endDate   = this.filters.toDate;

    this.transactionService.getPaged(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  (res: any) => { 
          this.transactions = res.content || []; 
          this.totalItems = res.totalElements || 0; 
          this.loading = false; 
        },
        error: ()         => { this.loading = false; }
      });
  }

  applyFilters(): void { 
    this.pageIndex = 0; 
    this.loadTransactions(); 
  }
  
  toggleFilters(): void { 
    this.showFilters = !this.showFilters; 
  }

  clearFilters(): void {
    this.filters = { type: '', accountId: '', fromDate: '', toDate: '' };
    this.filterForm.patchValue({ sortOption: 'DATE_DESC' }, { emitEvent: false });
    this.pageIndex = 0;
    this.loadTransactions();
  }

  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }

  trackByTransaction(_: number, tx: Transaction): number {
    return tx.id!;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.pageIndex = page - 1;
    this.loadTransactions();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end   = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  editTransaction(id: number): void { 
    this.router.navigate(['/transactions', id, 'edit']); 
  }

  navigateToAddTransaction(): void {
    this.router.navigate(['/transactions/new']);
  }

  deleteTransaction(id: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Transaction?',
        message: 'Are you sure you want to permanently delete this transaction? This action cannot be undone.',
        confirmLabel: 'Delete',
        isDanger: true
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(confirmed => {
      if (confirmed) {
        this.transactionService.delete(id).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.snackBar.open('Transaction deleted successfully', 'Close', { duration: 3000 });
            this.loadTransactions();
          },
          error: () => {
            this.snackBar.open('Failed to delete transaction', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  exportToCSV(): void {
    const rows = [
      ['Date', 'Type', 'Description', 'Account', 'Category', 'Amount'],
      ...this.transactions.map((tx: any) => [
        tx.transactionDate ?? '', tx.type ?? '', tx.description ?? '',
        tx.account?.name ?? '', tx.category?.name ?? '', tx.amount ?? 0
      ])
    ];
    const csv  = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  @HostListener('document:keydown.escape')
  onEsc(): void { 
    this.editingId = null; 
    this.editData = {}; 
  }

  getAccountName(tx: any): string  { return tx?.account?.name  ?? '—'; }
  getCategoryName(tx: any): string { return tx?.category?.name ?? '—'; }

  formatType(type: string): string {
    switch (type) {
      case 'EXPENSE':     return 'Expense';
      case 'INCOME':      return 'Income';
      case 'MONEY_GIVEN': return 'Money Given';
      case 'MONEY_TAKEN': return 'Money Taken';
      default:            return type;
    }
  }

  isNegativeTransaction(type: string): boolean { 
    return type === 'EXPENSE' || type === 'MONEY_GIVEN'; 
  }
  
  isPositiveTransaction(type: string): boolean { 
    return type === 'MONEY_TAKEN' || type === 'INCOME'; 
  }

  formatAmount(tx: any): string {
    const abs = Math.abs(tx.amount ?? 0);
    const fmt = abs.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return this.isNegativeTransaction(tx.type) ? `-₹${fmt}` : `+₹${fmt}`;
  }
}