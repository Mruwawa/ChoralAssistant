import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CalendarService } from './calendar.service';
import { CalendarEvent } from '../Models/calendar-event';

describe('CalendarService', () => {
  let service: CalendarService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CalendarService]
    });

    service = TestBed.inject(CalendarService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add an event', () => {
    const mockEvent: CalendarEvent = {
      title: 'Test Event',
      description: 'Test Description',
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      location: 'Test Location',
      pieces: [],
      id: '1'
    };

    service.addEvent(mockEvent).subscribe(response => {
      expect(response.status).toBe(200);
    });

    const req = httpMock.expectOne('/api/add-event');
    expect(req.request.method).toBe('POST');
    req.flush({}, { status: 200, statusText: 'OK' });
  });

  it('should get events', () => {
    const mockEvents: CalendarEvent[] = [
      {
        title: 'Test Event 1',
        description: 'Test Description 1',
        start: new Date().toISOString(),
        end: new Date().toISOString(),
        location: 'Test Location 1',
        pieces: [],
        id: '1'
      },
      {
        title: 'Test Event 2',
        description: 'Test Description 2',
        start: new Date().toISOString(),
        end: new Date().toISOString(),
        location: 'Test Location 2',
        pieces: [],
        id: '2'
      }
    ];

    const start = new Date();
    const end = new Date();

    service.getEvents(start, end).subscribe(events => {
      expect(events.length).toBe(2);
      expect(events).toEqual(mockEvents);
    });

    const req = httpMock.expectOne(`/api/calendar?start=${start.toISOString()}&end=${end.toISOString()}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEvents);
  });

  it('should export calendar', () => {
    const mockBlob = new Blob(['test'], { type: 'application/json' });

    service.exportCalendar().subscribe(response => {
      expect(response).toEqual(mockBlob);
    });

    const req = httpMock.expectOne('/api/export-calendar');
    expect(req.request.method).toBe('GET');
    req.flush(mockBlob);
  });
});