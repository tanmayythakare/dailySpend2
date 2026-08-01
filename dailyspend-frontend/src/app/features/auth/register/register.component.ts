import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SHARED_IMPORTS } from '../../../shared/shared.imports';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  // Backend RegisterRequest: { username, password } only — no email
  registerData = {
    username: '',
    password: ''
  };

  confirmPassword = '';
  showPassword = false;
  showPasswordConfirm = false;
  agreeToTerms = false;

  loading        = false;
  errorMessage   = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.registerData.username || !this.registerData.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }
    if (this.registerData.username.length < 3) {
      this.errorMessage = 'Username must be at least 3 characters long';
      return;
    }
    if (this.registerData.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long';
      return;
    }
    if (this.registerData.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
    if (!this.agreeToTerms) {
      this.errorMessage = 'You must agree to the Terms of Service and Privacy Policy';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.registerData).subscribe({
      next: () => {
        this.successMessage = 'Account created successfully! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (error) => {
        if (error.status === 409) this.errorMessage = 'Username already exists';
        else if (error.status === 400) this.errorMessage = error.error?.message || 'Invalid registration data';
        else if (error.status === 0) this.errorMessage = 'Cannot connect to server.';
        else this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }
}