import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService } from '../../core/services/profile.service';
import { ThemeService } from '../../core/services/theme.service';
import { UserProfile } from '../../models/user.model';
import { SHARED_IMPORTS } from '../../shared/shared.imports';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  profileForm: FormGroup;
  username = '';
  loading = false;
  saving = false;
  selectedTheme = 'system';

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private snackBar: MatSnackBar,
    private themeService: ThemeService,
    private dialog: MatDialog
  ) {
    this.profileForm = this.fb.group({
      upiId: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/)]],
      upiDisplayName: ['', Validators.maxLength(100)]
    });
  }

  ngOnInit(): void {
    this.themeService.activeTheme$.subscribe(theme => {
      this.selectedTheme = theme;
    });
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.username = profile.username;
        this.profileForm.patchValue({
          upiId: profile.upiId || '',
          upiDisplayName: profile.upiDisplayName || ''
        });
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load profile details', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      return;
    }
    const upi = this.profileForm.value.upiId;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Update UPI Payment ID',
        message: `Are you sure you want to update your UPI payment ID to: ${upi}?\n\nPlease verify this handle is correct so collections can resolve to your account.`,
        confirmLabel: 'Update',
        cancelLabel: 'Cancel'
      },
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.executeSaveProfile();
      }
    });
  }

  private executeSaveProfile(): void {
    this.saving = true;
    const payload = this.profileForm.value;
    this.profileService.updateProfile(payload).subscribe({
      next: (profile) => {
        this.username = profile.username;
        this.profileForm.patchValue({
          upiId: profile.upiId || '',
          upiDisplayName: profile.upiDisplayName || ''
        });
        this.snackBar.open('Payment setup updated successfully', 'Close', { duration: 3000 });
        this.saving = false;
      },
      error: () => {
        this.snackBar.open('Failed to update payment setup', 'Close', { duration: 3000 });
        this.saving = false;
      }
    });
  }

  selectTheme(theme: string): void {
    this.themeService.setTheme(theme as 'light' | 'dark' | 'system');
  }
}

