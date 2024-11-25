import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CalendarEvent } from '../Models/calendar-event';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  constructor() { }

  private httpClient = inject(HttpClient);

  addEvent(event: CalendarEvent) {
    return this.httpClient.post("/api/add-event", event, { observe: 'response' });
  }

  getEvents(start: Date, end: Date): Observable<CalendarEvent[]> {
    return this.httpClient.get<CalendarEvent[]>("/api/calendar", { params: { start: start.toISOString(), end: end.toISOString() } });
  }

  exportCalendar() {
    return this.httpClient.get("/api/export-calendar", { responseType: 'blob' });
  }
}
