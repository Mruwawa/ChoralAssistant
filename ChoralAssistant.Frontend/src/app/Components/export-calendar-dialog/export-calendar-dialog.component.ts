import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-export-calendar-dialog',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './export-calendar-dialog.component.html',
  styleUrl: './export-calendar-dialog.component.scss'
})
export class ExportCalendarDialogComponent {
  url: string = inject(MAT_DIALOG_DATA).url;
  private dialogRef: MatDialogRef<ExportCalendarDialogComponent> = inject(MatDialogRef);
}
