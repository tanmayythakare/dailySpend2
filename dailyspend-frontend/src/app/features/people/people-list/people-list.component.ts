import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PersonService } from '../../../core/services/person.service';
import { PersonBalanceDto } from '../../../models/person.model';
import { MatDialog } from '@angular/material/dialog';
import { SHARED_IMPORTS } from '../../../shared/shared.imports';
import { QRModalComponent } from '../../../shared/components/qr-modal/qr-modal.component';

@Component({
  selector: 'app-people-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SHARED_IMPORTS],
  templateUrl: './people-list.component.html',
  styleUrls: ['./people-list.component.scss']
})
export class PeopleListComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // Use PersonBalanceDto (from /with-balances) so we have real balance data
  people:        PersonBalanceDto[] = [];
  loading        = false;
  errorMessage   = '';
  successMessage = '';
  showAddForm    = false;
  newPersonName  = '';

  totalOwedToYou = 0;
  totalYouOwe    = 0;
  activeLedgers  = 0;

  constructor(
    private personService: PersonService, 
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void { this.loadPeople(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPeople(): void {
    this.loading = true;
    this.errorMessage = '';

    this.personService.getAllWithBalances()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.people = data;
          this.calculateSummary();
          this.loading = false;
        },
        error: () => { this.errorMessage = 'Failed to load people. Please try again.'; this.loading = false; }
      });
  }

  calculateSummary(): void {
    let owed = 0;
    let owe = 0;
    let active = 0;

    this.people.forEach(p => {
      const bal = p.balance ?? 0;
      if (bal > 0) {
        owed += bal;
        active++;
      } else if (bal < 0) {
        owe += Math.abs(bal);
        active++;
      }
    });

    this.totalOwedToYou = owed;
    this.totalYouOwe = owe;
    this.activeLedgers = active;
  }

  addPerson(): void {
    if (!this.newPersonName.trim()) { this.errorMessage = 'Please enter a person name'; return; }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.personService.createPerson({ name: this.newPersonName.trim() })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (person: any) => {
          this.successMessage = `${person.name} added successfully!`;
          this.newPersonName = '';
          this.showAddForm = false;
          this.loadPeople();
        },
        error: () => { this.errorMessage = 'Failed to add person. Please try again.'; this.loading = false; }
      });
  }

  confirmDeletePersonId: number | null = null;

  requestDeletePerson(id: number): void { this.confirmDeletePersonId = id; }
  cancelDeletePerson(): void { this.confirmDeletePersonId = null; }

  deletePerson(personId: number): void {
    this.confirmDeletePersonId = null;
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.personService.deletePerson(personId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => { this.successMessage = 'Person deleted successfully!'; this.loadPeople(); },
        error: (error: any) => {
          this.errorMessage = error.error?.message || 'Failed to delete person. Please try again.';
          this.loading = false;
        }
      });
  }

  viewDetails(personId: number): void {
    this.router.navigate(['/people', personId]);
  }

  getBalance(person: PersonBalanceDto): number {
    return person.balance ?? 0;
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map((w: string) => w[0]).join('').toUpperCase().substring(0, 2);
  }

  formatCurrency(value: number | undefined | null): string {
    if (value == null) return '₹0.00';
    const abs = Math.abs(value);
    const fmt = abs.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return value < 0 ? `-₹${fmt}` : `₹${fmt}`;
  }

  openQRCollectModal(person: PersonBalanceDto, event: Event): void {
    event.stopPropagation();
    this.dialog.open(QRModalComponent, {
      width: '440px',
      data: {
        personId: person.id,
        personName: person.name
      }
    });
  }
}