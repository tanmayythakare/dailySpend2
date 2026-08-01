import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingService } from './core/services/loading.service';
import { ThemeService } from './core/services/theme.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',

  // ⭐ MUST BE INSIDE COMPONENT
  animations: [
    trigger('routeFade', [
      transition('* <=> *', [
        style({ opacity: 0 }),
        animate('200ms ease-in-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class AppComponent implements OnInit {

  loading$ = this.loadingService.loading$;
  title = 'dailyspend-frontend';

  constructor(
    private loadingService: LoadingService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {}
}

