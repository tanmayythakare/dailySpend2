import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatDatepickerModule, 
    MatNativeDateModule, 
    MatInputModule, 
    MatFormFieldModule
  ],
  template: `
    <div class="form-field">
      <label [for]="id" *ngIf="label">
        {{ label }} <span *ngIf="required" style="color: var(--negative)">*</span>
      </label>
      
      <!-- Datepicker variant -->
      <ng-container *ngIf="type === 'date'; else standardInput">
        <mat-form-field appearance="outline" class="w-full premium-select-field">
          <input
            matInput
            [matDatepicker]="picker"
            [id]="id"
            [placeholder]="placeholder"
            [disabled]="disabled"
            [required]="required"
            [value]="val"
            (dateChange)="onDateChange($event)"
            (blur)="onBlur()"
          />
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>
      </ng-container>

      <ng-template #standardInput>
        <div class="input-wrapper" [class.large-wrapper]="size === 'large'">
          <span *ngIf="prefix" class="input-prefix">{{ prefix }}</span>
          <span *ngIf="iconPrefix" class="input-icon-prefix material-icons">{{ iconPrefix }}</span>
          <input
            [id]="id"
            [type]="type"
            [placeholder]="placeholder"
            [disabled]="disabled"
            [required]="required"
            [value]="val"
            (input)="onChangeValue($event)"
            (blur)="onBlur()"
            [class.has-prefix]="prefix"
            [class.has-icon-prefix]="iconPrefix"
            [class.input-large]="size === 'large'"
            [style.padding-right]="(id && id.toLowerCase().includes('password')) ? '40px' : null"
          />
          <ng-content></ng-content>
        </div>
      </ng-template>
      <span class="error-text" *ngIf="errorMsg">{{ errorMsg }}</span>
    </div>
  `,
  styles: [`
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }
    .input-prefix {
      position: absolute;
      left: 12px;
      color: var(--gray-400);
      font-size: var(--font-size-body);
      font-family: var(--font-sans);
      pointer-events: none;
    }
    input.has-prefix {
      padding-left: 36px !important;
    }
    .input-wrapper.large-wrapper .input-prefix {
      font-size: 18px;
      font-weight: 700;
      color: var(--gray-700);
      left: 14px;
    }
    input.input-large {
      font-size: 18px;
      font-weight: 700;
      height: 48px;
      padding-left: 32px !important;
    }
    .error-text {
      font-size: var(--font-size-caption);
      color: var(--negative-text);
      margin-top: 4px;
    }
    .input-icon-prefix {
      position: absolute;
      left: 12px;
      color: var(--gray-400);
      font-size: 20px;
      pointer-events: none;
    }
    input.has-icon-prefix {
      padding-left: 36px !important;
    }

    /* ── Datepicker premium layout styles matching app-select ── */
    :host ::ng-deep .premium-select-field {
      width: 100%;
      display: block;

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
      .mat-mdc-form-field-suffix {
        display: flex;
        align-items: center;
        margin-left: var(--space-2);
        
        .mat-mdc-icon-button {
          padding: 4px !important;
          width: 32px !important;
          height: 32px !important;
        }
      }
      .mat-datepicker-toggle-default-icon {
        width: 20px !important;
        height: 20px !important;
        color: var(--gray-500);
      }
      input.mat-mdc-input-element {
        font-family: var(--font-sans);
        font-size: 14px;
        color: var(--gray-900) !important;
        border: none !important;
        padding: 0 !important;
        margin: 0 !important;
        height: auto !important;
        box-shadow: none !important;
      }
      
      /* Hide default material outline/border */
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
      useExisting: forwardRef(() => AppInputComponent),
      multi: true
    }
  ]
})
export class AppInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() required = false;
  @Input() disabled = false;
  @Input() id = '';
  @Input() prefix = '';
  @Input() iconPrefix = '';
  @Input() errorMsg = '';
  @Input() size: 'normal' | 'large' = 'normal';

  val: any = '';

  onChange: any = () => {};
  onTouch: any = () => {};

  writeValue(value: any): void {
    if (this.type === 'date' && value) {
      let date: Date | null = null;
      if (value instanceof Date) {
        date = value;
      } else if (typeof value === 'string') {
        const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
          date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
        } else {
          const parsed = Date.parse(value);
          if (!isNaN(parsed)) {
            date = new Date(parsed);
          }
        }
      }
      if (date && !isNaN(date.getTime())) {
        this.val = date;
        return;
      }
    }
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

  onChangeValue(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (this.val !== value) {
      this.val = value;
      this.onChange(value);
    }
  }

  onDateChange(event: any): void {
    const date = event.value;
    if (date instanceof Date && !isNaN(date.getTime())) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const strVal = `${y}-${m}-${d}`;
      
      // Prevent infinite loops by comparing string values of the dates
      const currentStr = this.val instanceof Date 
        ? `${this.val.getFullYear()}-${String(this.val.getMonth() + 1).padStart(2, '0')}-${String(this.val.getDate()).padStart(2, '0')}`
        : this.val;
        
      if (currentStr !== strVal) {
        this.val = date;
        this.onChange(strVal);
      }
    } else {
      if (this.val !== null && this.val !== '') {
        this.val = null;
        this.onChange('');
      }
    }
  }

  onBlur(): void {
    this.onTouch();
  }
}
