import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      class="btn"
      [class.btn--primary]="variant === 'primary'"
      [class.btn--outline]="variant === 'outline'"
      [class.btn--ghost]="variant === 'ghost'"
      [class.btn--danger]="variant === 'danger'"
      [class.btn--icon]="variant === 'icon'"
      [disabled]="disabled || loading"
      [attr.aria-busy]="loading"
      [attr.aria-disabled]="disabled"
      (click)="onClick($event)">
      <span *ngIf="loading" class="btn-spinner"></span>
      <span *ngIf="!loading" class="btn-content">
        <ng-content></ng-content>
      </span>
    </button>
  `,
  styles: [`
    .btn-spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.25);
      border-top-color: currentColor;
      border-radius: 50%;
      animation: btn-spin 0.6s linear infinite;
      vertical-align: middle;
    }
    .btn-content {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
    }
    @keyframes btn-spin {
      to { transform: rotate(360deg); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppButtonComponent {
  @Input() variant: 'primary' | 'outline' | 'ghost' | 'danger' | 'icon' = 'primary';
  @Input() loading = false;
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' = 'button';

  @Output() click = new EventEmitter<Event>();

  onClick(event: Event): void {
    event.stopPropagation();
    if (!this.disabled && !this.loading) {
      this.click.emit(event);
    }
  }
}
