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
  daysOfMonth: { day: number, events: CalendarEvent[], isToday: boolean, dayName: string }[] = [];
  firstDayOfMonth!: number;

  currentMonth!: number;
  currentYear!: number;

  dialog: MatDialog = inject(MatDialog);

  monthNames: string[] = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
  ];

  dayNames: string[] = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd'];

  mode: 'month' | 'week' = 'month';

  ngOnInit() {
    this.currentMonth = new Date().getMonth();
    this.currentYear = new Date().getFullYear();
    if (window.innerWidth > 768) {
      this.loadFullMonth();
      this.mode = 'month';
    }
    else {
      this.loadWeek();
      this.mode = 'week';
    }
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
    this.loadFullMonth();
  }

  loadWeek() {
    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay + 1);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

    for (let i = 1; i <= 7; i++) {
      let dayNumber = startOfWeek.getDate() + i - 1;
      if (dayNumber > daysInMonth) {
        dayNumber = dayNumber - daysInMonth;
      }
      this.daysOfMonth.push({
        day: dayNumber,
        events: [],
        isToday: i == currentDay && this.currentMonth == new Date().getMonth() && this.currentYear == new Date().getFullYear(),
        dayName: this.dayNames[i - 1]
      });
    }

    this.calendarService.getEvents(startOfWeek, endOfWeek).subscribe(
      {
        next: (response: CalendarEvent[]) => {
          response.forEach(event => {
            const eventDate = new Date(event.start);
            const index = eventDate.getDay();
            this.daysOfMonth[index].events.push(event);
          });
        },
        error: (error) => {
          console.error(error);
        }
      }
    );
  }

  loadFullMonth() {
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const firstDayOfMonthDate = new Date(this.currentYear, this.currentMonth, 1);
    const lastDayOfMonthDate = new Date(this.currentYear, this.currentMonth, daysInMonth + 1, 1);
    this.firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 0).getDay();

    const today = new Date().getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      this.daysOfMonth.push({
        day: i, events: [], isToday: i == today && this.currentMonth == new Date().getMonth() && this.currentYear == new Date().getFullYear(),
        dayName: this.dayNames[new Date(this.currentYear, this.currentMonth, i).getDay()]
      });
    }

    for (let i = 0; i < this.firstDayOfMonth; i++) {
      this.daysOfMonth.unshift({ day: 0, events: [], isToday: false, dayName: '' });
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
    const dialogRef = this.dialog.open(AddEventComponent, { width: window.innerWidth < 800 ? '90%' : '50%', });

    dialogRef.afterClosed().subscribe((result: { created: boolean }) => {
      if (result?.created) {
        this.daysOfMonth = [];
        this.loadFullMonth();
      }
    }
    );
  }

  openEventDetails(event: CalendarEvent) {
    const dialogRef = this.dialog.open(EventDetailsComponent,
      {
        width: window.innerWidth < 800 ? '90%' : '50%',
        data: { event }
      });

    dialogRef.afterClosed().subscribe((result: { removed: boolean }) => {
      if (result?.removed) {
        this.daysOfMonth = [];
        if (this.mode === 'week') {
          this.loadWeek();
        }
        else {
          this.loadFullMonth();
        }
      }
    }
    );
  }

  import() {
    const dialogRef = this.dialog.open(ImportCalendarDialogComponent, { width: window.innerWidth < 800 ? '90%' : '50%', });

    dialogRef
      .afterClosed()
      .subscribe((result: { imported: boolean }) => {
        if (result?.imported) {
          this.daysOfMonth = [];
          this.loadFullMonth();
        }
      });
  }

  export() {
    this.calendarService.exportCalendar().subscribe({
      next: (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        this.dialog.open(ExportCalendarDialogComponent, {
          width: window.innerWidth < 800 ? '90%' : '50%',
          data: { url }
        });
      },
      error: (error) => {
        console.error(error)
      }
    });
  }
}
