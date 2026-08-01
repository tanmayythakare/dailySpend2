import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state">
      <div class="empty-icon-wrap" *ngIf="icon">
        <span class="material-icons">{{ icon }}</span>
      </div>
      <h3 class="empty-title" *ngIf="title">{{ title }}</h3>
      <p class="empty-text" *ngIf="text">{{ text }}</p>
      <button *ngIf="actionText" class="btn btn--primary mt-4" (click)="actionClicked.emit()">
        {{ actionText }}
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  @Input() title = '';
  @Input() text = '';
  @Input() icon = 'receipt_long';
  @Input() actionText = '';

  @Output() actionClicked = new EventEmitter<void>();
}
