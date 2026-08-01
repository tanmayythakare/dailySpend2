import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { AppButtonComponent } from '../button/button.component';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, AppButtonComponent],
  template: `
    <div class="confirm-dialog-container">
      <div class="confirm-header">
        <span class="material-icons" [class.confirm-icon--danger]="data.isDanger">
          {{ data.isDanger ? 'warning' : 'help_outline' }}
        </span>
        <h2 class="confirm-title">{{ data.title }}</h2>
      </div>
      
      <p class="confirm-message">{{ data.message }}</p>

      <div class="confirm-actions">
        <app-button
          variant="outline"
          (click)="onCancel()"
        >
          {{ data.cancelLabel || 'Cancel' }}
        </app-button>
        <app-button
          [variant]="data.isDanger ? 'danger' : 'primary'"
          (click)="onConfirm()"
        >
          {{ data.confirmLabel || 'Confirm' }}
        </app-button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-dialog-container {
      padding: var(--space-5);
      background: var(--surface-card);
      border-radius: var(--radius-xl);
      border: 1px solid var(--gray-200);
      box-shadow: var(--shadow-xl);
      max-width: 400px;
    }
    .confirm-header {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-3);
    }
    .confirm-header .material-icons {
      font-size: var(--icon-lg);
      color: var(--brand-600);
      &.confirm-icon--danger {
        color: var(--negative-text);
      }
    }
    .confirm-title {
      font-size: var(--font-size-h3);
      font-weight: 600;
      color: var(--gray-900);
      margin: 0;
    }
    .confirm-message {
      font-size: var(--font-size-body);
      color: var(--gray-600);
      margin-bottom: var(--space-5);
      line-height: 1.5;
    }
    .confirm-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
    }
  `]
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
