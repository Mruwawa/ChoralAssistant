import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-import-calendar-dialog',
  standalone: true,
  imports: [MatButton],
  templateUrl: './import-calendar-dialog.component.html',
  styleUrl: './import-calendar-dialog.component.scss'
})
export class ImportCalendarDialogComponent {

  dialogRef: MatDialogRef<ImportCalendarDialogComponent> = inject(MatDialogRef);

  calendarFile!: File;

  httpClient: HttpClient = inject(HttpClient);

  calendarFileName: string = '';


  onFileChange(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.calendarFile = input.files[0];
      this.calendarFileName = this.calendarFile.name;
    };
  }

  submit() {
    var formData = new FormData();
    formData.append('file', this.calendarFile);

    this.httpClient.post('/api/import-calendar', formData).subscribe({
      next: data => {
      },
      error: error => {
        console.error(error);
      }
    });

    this.dialogRef.close();
  }

}
