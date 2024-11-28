import { Component, inject } from '@angular/core';
import { CalendarService } from '../../../Services/calendar.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CalendarEvent } from '../../../Models/calendar-event';
import { MatDialog } from '@angular/material/dialog';
import { AddEventComponent } from '../add-event/add-event.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { EventDetailsComponent } from '../event-details/event-details.component';
import { ExportCalendarDialogComponent } from '../export-calendar-dialog/export-calendar-dialog.component';
import { MatIcon } from '@angular/material/icon';
import { ImportCalendarDialogComponent } from '../import-calendar-dialog/import-calendar-dialog.component';


@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatDatepickerModule, MatNativeDateModule, MatChipsModule, MatIcon],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent {

  private calendarService = inject(CalendarService);
  daysOfMonth: { day: number, events: CalendarEvent[], isToday: boolean }[] = [];
  firstDayOfMonth!: number;

  currentMonth!: number;
  currentYear!: number;

  dialog: MatDialog = inject(MatDialog);

  monthNames: string[] = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
  ];

  ngOnInit() {
    this.currentMonth = new Date().getMonth();
    this.currentYear = new Date().getFullYear();
    this.loadMonth();
  }

  changeMonth(direction: number) {
    const newMonth = this.currentMonth + direction;

    if (newMonth < 0) {
      this.currentYear--;
    }
    if (newMonth > 11) {
      this.currentYear++;
    }

    if (newMonth < 0) {
      this.currentMonth = 11;
    }
    else if (newMonth > 11) {
      this.currentMonth = 0;
    }
    else {
      this.currentMonth = newMonth;
    }

    this.daysOfMonth = [];
    this.loadMonth();
  }

  loadMonth() {
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const firstDayOfMonthDate = new Date(this.currentYear, this.currentMonth, 1);
    const lastDayOfMonthDate = new Date(this.currentYear, this.currentMonth, daysInMonth + 1, 1);
    this.firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 0).getDay();

    const today = new Date().getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      this.daysOfMonth.push({ day: i, events: [], isToday: i == today && this.currentMonth == new Date().getMonth() && this.currentYear == new Date().getFullYear() });
    }

    for (let i = 0; i < this.firstDayOfMonth; i++) {
      this.daysOfMonth.unshift({ day: 0, events: [], isToday: false });
    }

    this.calendarService.getEvents(firstDayOfMonthDate, lastDayOfMonthDate).subscribe(
      {
        next: (response: CalendarEvent[]) => {
          response.forEach(event => {
            const eventDate = new Date(event.start);
            const day = eventDate.getDate();
            const index = this.firstDayOfMonth + day - 1;
            this.daysOfMonth[index].events.push(event);
          });
        },
        error: (error) => {
          console.error(error);
        }
      }
    );
  }

  addEvent() {
    const dialogRef = this.dialog.open(AddEventComponent, { width: '500px', height: '600px' });

    dialogRef.afterClosed().subscribe((result: { created: boolean }) => {
      if (result?.created) {
        this.daysOfMonth = [];
        this.loadMonth();
      }
    }
    );
  }

  openEventDetails(event: CalendarEvent) {
    const dialogRef = this.dialog.open(EventDetailsComponent,
      {
        width: '500px',
        height: '500px',
        data: { event }
      });

    dialogRef.afterClosed().subscribe((result: { removed: boolean }) => {
      if (result?.removed) {
        this.daysOfMonth = [];
        this.loadMonth();
      }
    }
    );
  }

  import() {
    const dialogRef = this.dialog.open(ImportCalendarDialogComponent, { width: '500px', height: '500px' });

    dialogRef
      .afterClosed()
      .subscribe((result: { imported: boolean }) => {
        if (result?.imported) {
          this.daysOfMonth = [];
          this.loadMonth();
        }
      });
  }

  export() {
    this.calendarService.exportCalendar().subscribe({
      next: (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        this.dialog.open(ExportCalendarDialogComponent, {
          width: '500px',
          height: '500px',
          data: { url }
        });
      },
      error: (error) => {
        console.error(error)
      }
    });
  }
}
