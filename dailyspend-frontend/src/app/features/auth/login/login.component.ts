import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { SHARED_IMPORTS } from '../../../shared/shared.imports';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnDestroy {

  private destroy$ = new Subject<void>();

  credentials = {
    username: '',
    password: ''
  };

  loading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (!this.credentials.username || !this.credentials.password) {
      this.errorMessage = 'Please enter both username and password';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          if (error.status === 401) {
            this.errorMessage = 'Invalid username or password';
          } else if (error.status === 0) {
            this.errorMessage = 'Cannot connect to server. Please check your connection.';
          } else {
            this.errorMessage = error.error?.message || 'Login failed. Please try again.';
          }
          this.loading = false;
        }
      });
  }
}
