import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" [class.card--hover]="hoverable" [class.card--lg]="large">
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppCardComponent {
  @Input() hoverable = false;
  @Input() large = false;
}
