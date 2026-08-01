import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '../../core/services/account.service';
import { CategoryService } from '../../core/services/category.service';
import { PersonService } from '../../core/services/person.service';
import { TransactionService } from '../../core/services/transaction.service';
import { Account } from '../../models/account.model';
import { Category } from '../../models/category.model';
import { Person } from '../../models/person.model';
import { SHARED_IMPORTS } from '../../shared/shared.imports';
import { MatSnackBar } from '@angular/material/snack-bar';

interface ParticipantSelectItem {
  person: Person;
  selected: boolean;
}

interface SplitShare {
  id: string; // 'me' or personId as string
  name: string;
  amount: number;
  percentage?: number;
}

@Component({
  selector: 'app-bill-splitter',
  standalone: true,
  imports: [SHARED_IMPORTS, FormsModule, ReactiveFormsModule],
  templateUrl: './bill-splitter.component.html',
  styleUrls: ['./bill-splitter.component.scss']
})
export class BillSplitterComponent implements OnInit {
  currentStep = 1;
  billForm: FormGroup;

  // Dropdown options
  accounts: Account[] = [];
  categories: Category[] = [];
  participants: ParticipantSelectItem[] = [];
  accountOptions: { label: string; value: any }[] = [];
  categoryOptions: { label: string; value: any }[] = [];

  // Split configurations
  includeMyself = true;
  splitMode: 'equal' | 'percentage' | 'custom' = 'equal';
  
  // Custom shares state
  shares: { [key: string]: number } = {}; // Holds percentages or custom amounts

  calculatedShares: SplitShare[] = [];

  submitting = false;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private categoryService: CategoryService,
    private personService: PersonService,
    private transactionService: TransactionService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.billForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required, Validators.maxLength(255)]],
      transactionDate: [new Date().toISOString().split('T')[0], Validators.required],
      accountId: [null, Validators.required],
      categoryId: [null]
    });
  }

  getNextButtonLabel(): string {
    switch (this.currentStep) {
      case 1: return 'Continue to Participants';
      case 2: return 'Continue to Split Method';
      case 3: return 'Review & Confirm';
      default: return 'Next Step';
    }
  }

  ngOnInit(): void {
    this.loadDropdownData();
    this.billForm.valueChanges.subscribe(() => {
      this.recalculateShares();
    });
  }

  loadDropdownData(): void {
    this.accountService.getAllAccounts().subscribe({
      next: (data) => {
        this.accounts = data;
        this.accountOptions = data.map(acc => ({
          label: `${acc.name} (₹${acc.balance})`,
          value: acc.id
        }));
        if (data.length > 0) {
          // Default to the account with the highest balance
          const sortedAcc = [...data].sort((a, b) => (b.balance || 0) - (a.balance || 0));
          this.billForm.patchValue({ accountId: sortedAcc[0].id });
        }
      }
    });

    this.categoryService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.categoryOptions = data.map(cat => ({
          label: cat.name,
          value: cat.id
        }));
      }
    });

    this.personService.getAll().subscribe({
      next: (data) => {
        this.participants = data.map(person => ({ person, selected: false }));
        this.recalculateShares();
      }
    });
  }

  get activeParticipantsCount(): number {
    let count = this.participants.filter(p => p.selected).length;
    if (this.includeMyself) {
      count += 1;
    }
    return count;
  }

  get totalBillAmount(): number {
    return this.billForm.value.amount || 0;
  }

  get selectedAccountName(): string {
    const accountId = this.billForm.value.accountId;
    const account = this.accounts.find(a => a.id === Number(accountId));
    return account ? account.name : '';
  }

  get selectedPeople(): Person[] {
    return this.participants.filter(p => p.selected).map(p => p.person);
  }

  // Navigation validation
  canGoToStep(step: number): boolean {
    if (step === 2) {
      return this.billForm.valid;
    }
    if (step === 3) {
      return this.billForm.valid && this.activeParticipantsCount > 0;
    }
    if (step === 4) {
      return this.billForm.valid && this.activeParticipantsCount > 0 && this.isSplitValid();
    }
    return true;
  }

  nextStep(): void {
    if (this.canGoToStep(this.currentStep + 1)) {
      this.currentStep++;
      if (this.currentStep === 3) {
        this.initShares();
      }
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step < this.currentStep || this.canGoToStep(step)) {
      this.currentStep = step;
      if (step === 3) {
        this.initShares();
      }
    }
  }

  toggleParticipant(item: ParticipantSelectItem): void {
    item.selected = !item.selected;
    this.initShares();
    this.recalculateShares();
  }

  initShares(): void {
    // Reset or populate shares if empty
    const currentKeys = Object.keys(this.shares);
    const expectedKeys = this.selectedPeople.map(p => p.id?.toString() || '');
    if (this.includeMyself) {
      expectedKeys.push('me');
    }

    // If keys don't match, re-initialize
    const matches = expectedKeys.length === currentKeys.length && 
                    expectedKeys.every(k => currentKeys.includes(k));
    
    if (!matches) {
      this.shares = {};
      const count = expectedKeys.length;
      if (count > 0) {
        if (this.splitMode === 'percentage') {
          const basePct = Math.floor((100 / count) * 100) / 100;
          const remainder = Math.round((100 - (basePct * count)) * 100) / 100;
          expectedKeys.forEach((k, idx) => {
            this.shares[k] = idx === 0 ? Math.round((basePct + remainder) * 100) / 100 : basePct;
          });
        } else if (this.splitMode === 'custom') {
          const baseAmt = Math.floor((this.totalBillAmount / count) * 100) / 100;
          const remainder = Math.round((this.totalBillAmount - (baseAmt * count)) * 100) / 100;
          expectedKeys.forEach((k, idx) => {
            this.shares[k] = idx === 0 ? Math.round((baseAmt + remainder) * 100) / 100 : baseAmt;
          });
        }
      }
    }
    this.recalculateShares();
  }

  setSplitMode(mode: 'equal' | 'percentage' | 'custom'): void {
    this.splitMode = mode;
    this.initShares();
    this.recalculateShares();
  }

  recalculateShares(): void {
    const total = this.totalBillAmount;
    const count = this.activeParticipantsCount;
    if (count === 0) {
      this.calculatedShares = [];
      return;
    }

    const result: SplitShare[] = [];

    // Equal mode
    if (this.splitMode === 'equal') {
      const shareVal = Math.floor((total / count) * 100) / 100;
      const remainder = Math.round((total - (shareVal * count)) * 100) / 100;
      
      let isFirst = true;
      if (this.includeMyself) {
        result.push({ id: 'me', name: 'You', amount: Math.round((shareVal + remainder) * 100) / 100 });
        isFirst = false;
      }
      this.selectedPeople.forEach(p => {
        const addedAmt = isFirst ? Math.round((shareVal + remainder) * 100) / 100 : shareVal;
        result.push({ id: p.id?.toString() || '', name: p.name, amount: addedAmt });
        isFirst = false;
      });
      this.calculatedShares = result;
      return;
    }

    // Percentage mode
    if (this.splitMode === 'percentage') {
      let allocatedAmountSum = 0;
      if (this.includeMyself) {
        const pct = this.shares['me'] || 0;
        result.push({ id: 'me', name: 'You', amount: Math.floor((total * pct / 100) * 100) / 100, percentage: pct });
      }
      this.selectedPeople.forEach(p => {
        const pct = this.shares[p.id?.toString() || ''] || 0;
        result.push({ id: p.id?.toString() || '', name: p.name, amount: Math.floor((total * pct / 100) * 100) / 100, percentage: pct });
      });
      
      result.forEach(s => allocatedAmountSum += s.amount);
      const amountRemainder = Math.round((total - allocatedAmountSum) * 100) / 100;
      
      if (amountRemainder !== 0 && result.length > 0) {
        const firstActive = result.find(s => (s.percentage || 0) > 0);
        if (firstActive) {
          firstActive.amount = Math.round((firstActive.amount + amountRemainder) * 100) / 100;
        } else {
          result[0].amount = Math.round((result[0].amount + amountRemainder) * 100) / 100;
        }
      }
      
      this.calculatedShares = result;
      return;
    }

    // Custom mode
    if (this.splitMode === 'custom') {
      if (this.includeMyself) {
        const amt = this.shares['me'] || 0;
        result.push({ id: 'me', name: 'You', amount: amt });
      }
      this.selectedPeople.forEach(p => {
        const amt = this.shares[p.id?.toString() || ''] || 0;
        result.push({ id: p.id?.toString() || '', name: p.name, amount: amt });
      });
      this.calculatedShares = result;
      return;
    }

    this.calculatedShares = [];
  }

  get splitSum(): number {
    if (this.splitMode === 'equal') return this.totalBillAmount;
    
    let sum = 0;
    const keys = this.selectedPeople.map(p => p.id?.toString() || '');
    if (this.includeMyself) {
      keys.push('me');
    }
    keys.forEach(k => {
      sum += this.shares[k] || 0;
    });
    return Math.round(sum * 100) / 100;
  }

  get unassignedRemainder(): number {
    if (this.splitMode === 'percentage') {
      return Math.round((100 - this.splitSum) * 100) / 100;
    }
    return Math.round((this.totalBillAmount - this.splitSum) * 100) / 100;
  }

  isSplitValid(): boolean {
    if (this.splitMode === 'equal') {
      return this.activeParticipantsCount > 0;
    }
    if (this.splitMode === 'percentage') {
      return Math.abs(this.splitSum - 100) < 0.01;
    }
    if (this.splitMode === 'custom') {
      return Math.abs(this.splitSum - this.totalBillAmount) < 0.01;
    }
    return false;
  }

  generatePreviewRequests(): any[] {
    const list = this.calculatedShares;
    const formVals = this.billForm.value;
    const requests: any[] = [];

    list.forEach(share => {
      if (share.amount <= 0) return;

      if (share.id === 'me') {
        // Myself gets recorded as EXPENSE
        requests.push({
          type: 'EXPENSE',
          amount: share.amount,
          transactionDate: formVals.transactionDate,
          description: `Split: ${formVals.description}`,
          accountId: formVals.accountId,
          categoryId: formVals.categoryId || null,
          personId: null
        });
      } else {
        // Other participants get recorded as MONEY_GIVEN (They owe me)
        requests.push({
          type: 'MONEY_GIVEN',
          amount: share.amount,
          transactionDate: formVals.transactionDate,
          description: `Split: ${formVals.description}`,
          accountId: formVals.accountId,
          personId: parseInt(share.id, 10)
        });
      }
    });

    return requests;
  }

  confirmAndSplit(): void {
    if (!this.isSplitValid() || this.submitting) return;

    this.submitting = true;
    const requests = this.generatePreviewRequests();

    if (requests.length === 0) {
      this.snackBar.open('Cannot save split with ₹0 shares', 'Close', { duration: 3000 });
      this.submitting = false;
      return;
    }

    this.transactionService.createBatchTransactions(requests).subscribe({
      next: () => {
        this.snackBar.open('Bill split created successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/transactions']);
      },
      error: () => {
        this.snackBar.open('Failed to save bill split transactions', 'Close', { duration: 3000 });
        this.submitting = false;
      }
    });
  }

  onPercentageChange(id: string, value: number): void {
    this.adjustPercentageShares(id, value);
    this.recalculateShares();
  }

  adjustPercentageShares(changedId: string, newValue: number): void {
    const keys = Object.keys(this.shares);
    if (keys.length <= 1) {
      this.shares[changedId] = 100;
      return;
    }

    newValue = Math.max(0, Math.min(100, newValue));
    const oldValue = this.shares[changedId] || 0;
    const diff = newValue - oldValue;
    this.shares[changedId] = newValue;

    const otherKeys = keys.filter(k => k !== changedId);
    let remainingAdjustment = -diff;

    for (let iter = 0; iter < 10 && Math.abs(remainingAdjustment) > 0.001; iter++) {
      if (remainingAdjustment < 0) {
        const eligibleKeys = otherKeys.filter(k => (this.shares[k] || 0) > 0);
        if (eligibleKeys.length === 0) break;
        
        const share = remainingAdjustment / eligibleKeys.length;
        let allocated = 0;
        eligibleKeys.forEach(k => {
          const currentVal = this.shares[k] || 0;
          const newVal = currentVal + share;
          if (newVal < 0) {
            this.shares[k] = 0;
            allocated -= currentVal;
          } else {
            this.shares[k] = Math.round(newVal * 100) / 100;
            allocated += Math.round(newVal * 100) / 100 - currentVal;
          }
        });
        remainingAdjustment -= allocated;
      } else {
        const eligibleKeys = otherKeys.filter(k => (this.shares[k] || 0) < 100);
        if (eligibleKeys.length === 0) break;

        const share = remainingAdjustment / eligibleKeys.length;
        let allocated = 0;
        eligibleKeys.forEach(k => {
          const currentVal = this.shares[k] || 0;
          const newVal = currentVal + share;
          if (newVal > 100) {
            this.shares[k] = 100;
            allocated += (100 - currentVal);
          } else {
            this.shares[k] = Math.round(newVal * 100) / 100;
            allocated += Math.round(newVal * 100) / 100 - currentVal;
          }
        });
        remainingAdjustment -= allocated;
      }
    }

    this.fixRoundingErrors(changedId);
  }

  fixRoundingErrors(changedId: string): void {
    const keys = Object.keys(this.shares);
    let sum = 0;
    keys.forEach(k => sum += this.shares[k] || 0);
    const error = 100 - sum;
    if (Math.abs(error) > 0.001) {
      const adjustKey = keys
        .filter(k => k !== changedId)
        .reduce((a, b) => (this.shares[a] || 0) > (this.shares[b] || 0) ? a : b, keys.filter(k => k !== changedId)[0]);
      
      if (adjustKey) {
        const newVal = (this.shares[adjustKey] || 0) + error;
        this.shares[adjustKey] = Math.round(Math.max(0, Math.min(100, newVal)) * 100) / 100;
      }
    }
  }
}
