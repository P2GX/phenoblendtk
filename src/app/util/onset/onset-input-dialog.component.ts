// onset-input-dialog.component.ts
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-onset-input-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Enter Onset</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" style="width: 100%">
        <mat-label>Onset (e.g. "P32Y" or "Childhood onset")</mat-label>
        <input matInput [(ngModel)]="onsetValue" (keydown.enter)="save()">
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close(null)">Cancel</button>
      <button mat-flat-button color="primary" (click)="save()">Save</button>
    </mat-dialog-actions>
  `
})
export class OnsetInputDialogComponent {
  protected readonly dialogRef = inject(MatDialogRef<OnsetInputDialogComponent>);
  protected onsetValue = '';

  protected save(): void {
    const trimmed = this.onsetValue.trim();
    this.dialogRef.close(trimmed || null);
  }
}