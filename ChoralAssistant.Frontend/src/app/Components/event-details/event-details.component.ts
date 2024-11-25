import { Component, inject } from '@angular/core';
import { CalendarEvent } from '../../Models/calendar-event';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogRef } from '@angular/cdk/dialog';
import { DatePipe } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [DatePipe, MatChipsModule, RouterLink, MatIcon],
  templateUrl: './event-details.component.html',
  styleUrl: './event-details.component.scss'
})
export class EventDetailsComponent {
  removed?: boolean;
  eventDetails: CalendarEvent = inject(MAT_DIALOG_DATA).event
  private dialogRef: MatDialogRef<EventDetailsComponent> = inject(MatDialogRef);
  private httpClient: HttpClient = inject(HttpClient);

  close() {
    this.dialogRef.close();
  }

  removeEvent() {
    this.httpClient.post('/api/calendar/remove', { id: this.eventDetails.id }, { observe: 'response' }).subscribe(
      {
        next: (response) => {
          if (response.status === 200) {
            this.dialogRef.close({ removed: true });
          }
        },
        error: (error) => {
          console.error(error);
        }
      }
    );
  }
}
