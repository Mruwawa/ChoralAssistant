import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './confirm.component.html',
  styleUrl: './confirm.component.scss'
})
export class ConfirmComponent {
  title = inject(MAT_DIALOG_DATA).title;
  message = inject(MAT_DIALOG_DATA).message;
  noText = inject(MAT_DIALOG_DATA).noText;
  yesText = inject(MAT_DIALOG_DATA).yesText;
  dialogRef = inject(MatDialogRef);

  yes() {
    this.dialogRef.close(true);
  }

  no() {
    this.dialogRef.close(false);
  }
}
