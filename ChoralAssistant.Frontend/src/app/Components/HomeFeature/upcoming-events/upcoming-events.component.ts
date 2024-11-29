import { Component, inject } from '@angular/core';
import { CalendarService } from '../../../Services/calendar.service';
import { CalendarEvent } from '../../../Models/calendar-event';
import { MatCardModule } from '@angular/material/card';
import { DatePipe } from '@angular/common';
import { MatDivider } from '@angular/material/divider';
import { MatRippleModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { EventDetailsComponent } from '../../CalendarFeature/event-details/event-details.component';


@Component({
  selector: 'app-upcoming-events',
  standalone: true,
  imports: [MatCardModule, DatePipe, MatDivider, MatRippleModule],
  templateUrl: './upcoming-events.component.html',
  styleUrl: './upcoming-events.component.scss'
})
export class UpcomingEventsComponent {
  events: CalendarEvent[] = [];

  calendarService = inject(CalendarService);
  dialog: MatDialog = inject(MatDialog);

  async ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.events = [];
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 7);
    this.calendarService.getEvents(start, end).subscribe({
      next: events => {
        this.events = events;
      }
    });
  }

  eventDetails(event: CalendarEvent) {
    const dialogRef = this.dialog.open(EventDetailsComponent,
      {
        width: window.innerWidth < 800 ? '90%' : '50%',
        data: { event }
      });

    dialogRef.afterClosed().subscribe((result: { removed: boolean }) => {
      if (result?.removed) {
        this.loadEvents();
      }
    }
    );
  }
}
