import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PersonService } from '../../../core/services/person.service';
import { SHARED_IMPORTS } from '../../shared.imports';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as QRCode from 'qrcode';

export interface QRModalData {
  personId: number;
  personName: string;
}

@Component({
  selector: 'app-qr-modal',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './qr-modal.component.html',
  styleUrls: ['./qr-modal.component.scss']
})
export class QRModalComponent implements OnInit {
  @ViewChild('canvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;

  loading = true;
  upiId = '';
  upiDisplayName = '';
  amount = 0;
  upiUrl = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: QRModalData,
    private dialogRef: MatDialogRef<QRModalComponent>,
    private personService: PersonService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.personService.getQrPayload(this.data.personId).subscribe({
      next: (payload) => {
        this.upiId = payload.upiId;
        this.upiDisplayName = payload.payeeName;
        this.amount = payload.amount;
        
        const encodedUpiId = encodeURIComponent(this.upiId);
        const encodedName = encodeURIComponent(this.upiDisplayName);
        const encodedNote = encodeURIComponent(payload.note);
        
        this.upiUrl = `upi://pay?pa=${encodedUpiId}&pn=${encodedName}&am=${this.amount.toFixed(2)}&tn=${encodedNote}&cu=INR&tr=${payload.txnRef}`;
        
        this.loading = false;
        setTimeout(() => this.drawQR(), 0);
      },
      error: (err) => {
        const errMsg = err.error?.message || 'Failed to load payment credentials.';
        this.snackBar.open(errMsg, 'Close', { duration: 4000 });
        this.dialogRef.close();
      }
    });
  }

  drawQR(): void {
    if (!this.canvas) return;
    QRCode.toCanvas(this.canvas.nativeElement, this.upiUrl, {
      width: 220,
      margin: 1,
      color: {
        dark: '#0f172a', // slate-900
        light: '#ffffff'
      }
    }, (error) => {
      if (error) {
        console.error('QR Code generation error:', error);
        this.snackBar.open('Failed to generate QR code', 'Close', { duration: 3000 });
      }
    });
  }

  downloadQR(): void {
    if (!this.canvas) return;
    const dataUrl = this.canvas.nativeElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `collect-${this.data.personName}-${this.amount}.png`;
    link.click();
    this.snackBar.open('QR Code image downloaded', 'Close', { duration: 2000 });
  }

  async shareQR(): Promise<void> {
    if (!this.canvas) return;
    try {
      const dataUrl = this.canvas.nativeElement.toDataURL('image/png');
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'payment_qr.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'UPI Payment QR',
          text: `Pay ${this.upiDisplayName} ₹${this.amount} for settlement.`
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(this.upiUrl);
        this.snackBar.open('UPI payment link copied to clipboard', 'Close', { duration: 3000 });
      } else {
        this.snackBar.open('Sharing not supported on this browser', 'Close', { duration: 3000 });
      }
    } catch (err) {
      console.error('Error sharing QR Code:', err);
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(this.upiUrl);
        this.snackBar.open('UPI link copied as fallback', 'Close', { duration: 3000 });
      }
    }
  }

  goToSettings(): void {
    this.dialogRef.close();
    this.router.navigate(['/settings']);
  }

  close(): void {
    this.dialogRef.close();
  }
}
