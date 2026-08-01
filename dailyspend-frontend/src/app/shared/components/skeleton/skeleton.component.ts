import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-wrap">
      <div *ngFor="let item of items" class="skeleton-item" 
        [class.skeleton-item--line]="type === 'line'"
        [class.skeleton-item--circle]="type === 'circle'"
        [class.skeleton-item--card]="type === 'card'"
        [class.skeleton-item--table]="type === 'table'">
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .skeleton-wrap {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      width: 100%;
    }
    .skeleton-item {
      background: linear-gradient(90deg, var(--gray-100) 25%, var(--gray-200) 50%, var(--gray-100) 75%);
      background-size: 200% 100%;
      animation: loading-skeleton 1.5s infinite linear;
    }
    .skeleton-item--line {
      height: 16px;
      width: 100%;
      border-radius: 4px;
    }
    .skeleton-item--circle {
      height: 40px;
      width: 40px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .skeleton-item--card {
      height: 120px;
      width: 100%;
      border-radius: var(--radius-lg);
    }
    .skeleton-item--table {
      height: 38px;
      width: 100%;
      border-radius: 6px;
    }
    @keyframes loading-skeleton {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class LoadingSkeletonComponent implements OnInit {
  @Input() type: 'line' | 'circle' | 'card' | 'table' = 'line';
  @Input() count = 1;

  items: number[] = [];

  ngOnInit(): void {
    this.items = Array(this.count).fill(0);
  }
}
