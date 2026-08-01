import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { AppCardComponent } from './components/card/card.component';
import { AppButtonComponent } from './components/button/button.component';
import { AppInputComponent } from './components/input/input.component';
import { AppSelectComponent } from './components/select/select.component';
import { LoadingSkeletonComponent } from './components/skeleton/skeleton.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';

export const SHARED_IMPORTS = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  RouterModule,

  MatButtonModule,
  MatInputModule,
  MatFormFieldModule,
  MatCardModule,
  MatToolbarModule,
  MatSidenavModule,
  MatSelectModule,
  MatDialogModule,
  MatSnackBarModule,
  MatProgressSpinnerModule,
  MatMenuModule,
  MatDatepickerModule,
  MatNativeDateModule,

  AppCardComponent,
  AppButtonComponent,
  AppInputComponent,
  AppSelectComponent,
  LoadingSkeletonComponent,
  EmptyStateComponent,
  PageHeaderComponent
] as const;
