import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSelectModule, MatFormFieldModule],
  template: `
    <div class="form-field">
      <label [for]="id" *ngIf="label">
        {{ label }} <span *ngIf="required" style="color: var(--negative)">*</span>
      </label>
      <mat-form-field appearance="outline" class="w-full premium-select-field">
        <mat-select
          [id]="id"
          [placeholder]="placeholder || emptyLabel || 'Select option'"
          [disabled]="disabled"
          [value]="val"
          (selectionChange)="onSelectionChange($event.value)"
          (blur)="onBlur()"
        >
          <mat-option *ngIf="allowEmpty" [value]="null">{{ emptyLabel || 'None' }}</mat-option>
          <mat-option *ngFor="let option of options" [value]="option.value">
            {{ option.label }}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </div>
  `,
  styles: [`
    :host ::ng-deep .premium-select-field {
      width: 100%;
      .mat-mdc-form-field-subscript-wrapper {
        display: none !important;
      }
      .mat-mdc-text-field-wrapper {
        height: 42px;
        border-radius: var(--radius-md) !important;
        background-color: var(--surface-card) !important;
        border: 1.5px solid var(--gray-200);
        padding: 0 var(--space-3) !important;
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        box-shadow: none;
      }
      .mat-mdc-form-field-flex {
        align-items: center !important;
        height: 100%;
      }
      .mat-mdc-form-field-infix {
        padding: 0 !important;
        min-height: auto !important;
        display: flex;
        align-items: center;
      }
      .mat-mdc-select {
        font-family: var(--font-sans);
        font-size: 14px;
        color: var(--gray-900) !important;
      }
      .mat-mdc-select-value,
      .mat-mdc-select-placeholder {
        color: var(--gray-800) !important;
      }
      /* Hide default material underline/border */
      .mdc-notched-outline {
        display: none !important;
      }
      /* Hover and Focus custom states */
      &:hover .mat-mdc-text-field-wrapper {
        border-color: var(--gray-300);
        background-color: var(--gray-50) !important;
      }
      &.mat-focused .mat-mdc-text-field-wrapper {
        border-color: var(--brand-400);
        box-shadow: 0 0 0 3px rgba(110,85,232,0.12);
        background-color: var(--surface-card) !important;
      }
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppSelectComponent),
      multi: true
    }
  ]
})
export class AppSelectComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() id = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() placeholder = '';
  @Input() allowEmpty = false;
  @Input() emptyLabel = '';
  @Input() options: { label: string; value: any }[] = [];

  val: any = null;

  onChange: any = () => {};
  onTouch: any = () => {};

  writeValue(value: any): void {
    this.val = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onSelectionChange(value: any): void {
    this.val = value;
    this.onChange(value);
  }

  onBlur(): void {
    this.onTouch();
  }
}
