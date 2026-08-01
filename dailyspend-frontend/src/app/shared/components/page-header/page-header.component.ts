import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ title }}</h1>
        <p class="text-sm text-muted mt-1" *ngIf="subtitle">{{ subtitle }}</p>
      </div>
      <div class="page-actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
