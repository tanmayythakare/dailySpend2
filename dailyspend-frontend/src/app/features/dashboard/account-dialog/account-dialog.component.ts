import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AccountService } from '../../../core/services/account.service';
import { SHARED_IMPORTS } from '../../../shared/shared.imports';

@Component({
  selector: 'app-account-dialog',
  standalone: true,
  imports: [SHARED_IMPORTS],
  template: `
    <div class="dialog-header">
      <h2 class="dialog-title">Add Account</h2>
      <button class="dialog-close-btn" (click)="onCancel()" aria-label="Close dialog">
        <span class="material-icons">close</span>
      </button>
    </div>

    <form (submit)="onSubmit()" class="dialog-form">
      <div *ngIf="errorMessage" class="alert alert--error mb-4">
        {{ errorMessage }}
      </div>

      <app-input
        id="account-name"
        label="Account Name"
        placeholder="e.g. HDFC Bank, Pocket Cash"
        [(ngModel)]="name"
        name="name"
        [required]="true"
        [disabled]="loading"
      ></app-input>

      <app-input
        id="account-balance"
        label="Initial Balance"
        type="number"
        placeholder="0.00"
        [(ngModel)]="balance"
        name="balance"
        prefix="₹"
        [disabled]="loading"
      ></app-input>

      <app-select
        id="account-type"
        label="Account Type"
        placeholder="Select account type"
        [(ngModel)]="type"
        name="type"
        [required]="true"
        [options]="typeOptions"
        [disabled]="loading"
      ></app-select>

      <div class="dialog-actions">
        <app-button
          variant="outline"
          (click)="onCancel()"
          [disabled]="loading"
        >
          Cancel
        </app-button>
        <app-button
          type="submit"
          [loading]="loading"
          [disabled]="!name.trim() || !type || loading"
        >
          Add Account
        </app-button>
      </div>
    </form>
  `,
  styles: [`
    :host {
      display: block;
      padding: var(--space-5);
      background: var(--surface-card);
      border-radius: var(--radius-xl);
    }
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-5);
    }
    .dialog-title {
      font-size: var(--font-size-h3);
      font-weight: 600;
      color: var(--gray-900);
      margin: 0;
      padding-left: 12px;
      border-left: 3px solid var(--brand-600);
      line-height: 1.25;
    }
    .dialog-close-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--gray-400);
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background-color var(--transition-fast), color var(--transition-fast);
      &:hover {
        background-color: var(--gray-100);
        color: var(--gray-700);
      }
    }
    .dialog-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      margin-top: var(--space-5);
    }
  `]
})
export class AccountDialogComponent {
  name = '';
  balance: number | null = null;
  type = '';
  loading = false;
  errorMessage = '';

  typeOptions = [
    { label: 'Cash', value: 'CASH' },
    { label: 'Bank', value: 'BANK' },
    { label: 'Credit Card', value: 'CREDIT' }
  ];

  constructor(
    private accountService: AccountService,
    private dialogRef: MatDialogRef<AccountDialogComponent>
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    if (!this.name.trim()) {
      this.errorMessage = 'Please enter an account name';
      return;
    }
    if (!this.type) {
      this.errorMessage = 'Please select an account type';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.accountService.createAccount({
      name: this.name.trim(),
      balance: this.balance || 0,
      type: this.type
    }).subscribe({
      next: (account) => {
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to create account.';
        this.loading = false;
      }
    });
  }
}
