import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { CalendarComponent } from './calendar.component';
import { CalendarService } from '../../../Services/calendar.service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { CalendarEvent } from '../../../Models/calendar-event';

(globalThis as any).import = {
  meta: {
    env: {
      NG_APP_GOOGLE_CLIENT_ID: 'mock-google-client-id',
      // Add other environment variables as needed
    }
  }
};

describe('CalendarComponent', () => {
  let component: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;
  let calendarServiceStub: Partial<CalendarService>;

  beforeEach(async () => {
    calendarServiceStub = {
      getEvents: () => of([]),
      exportCalendar: () => of(new Blob())
    };

    await TestBed.configureTestingModule({
      imports: [CalendarComponent, MatDialogModule],
      providers: [{ provide: CalendarService, useValue: calendarServiceStub }]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

  });

  it('should initialize with the current month and year', () => {
    const today = new Date();
    expect(component.currentMonth).toBe(today.getMonth());
    expect(component.currentYear).toBe(today.getFullYear());
  });

  it('should load full month view on wide screens', () => {
    spyOn(component, 'loadFullMonth');
    window.innerWidth = 1024;
    component.ngOnInit();
    expect(component.loadFullMonth).toHaveBeenCalled();
    expect(component.mode).toBe('month');
  });

  it('should load week view on narrow screens', () => {
    spyOn(component, 'loadWeek');
    window.innerWidth = 500;
    component.ngOnInit();
    expect(component.loadWeek).toHaveBeenCalled();
    expect(component.mode).toBe('week');
  });

  it('should change month correctly', () => {
    component.daysOfMonth = [];
    component.mode = 'month';
    component.currentMonth = 5; // June
    component.currentYear = 2023;
    component.changeMonth(1);
    expect(component.currentMonth).toBe(6); // July
    expect(component.currentYear).toBe(2023);

    component.changeMonth(-1);
    expect(component.currentMonth).toBe(5); // June
    expect(component.currentYear).toBe(2023);

    component.changeMonth(-6);
    expect(component.currentMonth).toBe(11); // December
    expect(component.currentYear).toBe(2022);
  });

  it('should load week correctly', () => {
    component.daysOfMonth = [];
    spyOn(component.calendarService, 'getEvents').and.returnValue(
      of([
        {
          title: 'Test event',
          description: 'Test description',
          start: '2023-06-01T',
          end: '2023-06-01T',
          location: 'Test location',
          pieces: [],
          id: '1'
        }
      ])
    );
    component.startOfWeek = new Date(2023, 5, 1); // June 1, 2023
    component.loadWeek();
    expect(component.daysOfMonth.length).toBe(7);
    expect(component.daysOfMonth[0].day).toBe(0);
  });

  it('should load full month correctly', () => {
    component.daysOfMonth = [];
    component.firstDayOfMonth = new Date(2023, 5, 1).getDate(); // June 1, 2023
    spyOn(component.calendarService, 'getEvents').and.returnValue(
      of([
      {
        title: 'Test event',
        description: 'Test description',
        start: '2023-06-01T00:00:00',
        end: '2023-06-01T23:59:59',
        location: 'Test location',
        pieces: [],
        id: '1'
      }
      ])
    );
    component.currentMonth = 5; // June
    component.currentYear = 2023;
    component.loadFullMonth();
    expect(component.daysOfMonth.length).toBeGreaterThan(28);
    expect(component.daysOfMonth[0].day).toBe(0);
  });

  it('should add event and reload month', () => {
    component.mode = 'month';

    const dialogRefMock = {
      afterClosed: jasmine.createSpy().and.returnValue(of({ created: true }))
    };

    spyOn(component.dialog, 'open').and.returnValue(dialogRefMock as any);


    spyOn(component, 'loadFullMonth');
    component.addEvent();
    expect(component.loadFullMonth).toHaveBeenCalled();
  });

  it('should open event details and reload if removed', () => {
    component.mode = 'month';
    const dialogRefMock = {
      afterClosed: jasmine.createSpy().and.returnValue(of({ removed: true }))
    };

    spyOn(component.dialog, 'open').and.returnValue(dialogRefMock as any);
    spyOn(component, 'loadFullMonth');
    
    component.openEventDetails({} as CalendarEvent);
    expect(component.loadFullMonth).toHaveBeenCalled();
  });

  it('should import calendar and reload month', () => {
    const dialogRefMock = {
      afterClosed: jasmine.createSpy().and.returnValue(of({ imported: true }))
    };

    spyOn(component.dialog, 'open').and.returnValue(dialogRefMock as any);
    spyOn(component, 'loadFullMonth');
    component.import();
    expect(component.loadFullMonth).toHaveBeenCalled();
  });

  it('should export calendar and open dialog', () => {

    spyOn(component.calendarService, 'exportCalendar').and.returnValue(of(new Blob()));
    spyOn(component.dialog, 'open');
    component.export();
    expect(component.dialog.open).toHaveBeenCalled();
  });

  it('should display the correct month and year', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h3')?.textContent).toContain(component.monthNames[component.currentMonth]);
    expect(compiled.querySelector('h3')?.textContent).toContain(component.currentYear.toString());
  });

  it('should display the correct days of the week', () => {
    const daysOfWeek = fixture.debugElement.queryAll(By.css('.md\\:grid div'));
    expect(daysOfWeek.length).toBe(7);
    expect(daysOfWeek[0].nativeElement.textContent).toContain('Poniedziałek');
    expect(daysOfWeek[1].nativeElement.textContent).toContain('Wtorek');
    expect(daysOfWeek[2].nativeElement.textContent).toContain('Środa');
    expect(daysOfWeek[3].nativeElement.textContent).toContain('Czwartek');
    expect(daysOfWeek[4].nativeElement.textContent).toContain('Piątek');
    expect(daysOfWeek[5].nativeElement.textContent).toContain('Sobota');
    expect(daysOfWeek[6].nativeElement.textContent).toContain('Niedziela');
  });

  it('should display the correct number of days in the month view', () => {
    component.daysOfMonth = [];
    component.loadFullMonth();
    fixture.detectChanges();
    const days = fixture.debugElement.queryAll(By.css('.day-card'));
    expect(days.length).toBe(component.daysOfMonth.length);
  });

  it('should display the correct number of days in the week view', () => {
    component.mode = 'week';
    window.innerWidth = 500;
    component.daysOfMonth = [];
    component.loadWeek();
    fixture.detectChanges();
    const days = fixture.debugElement.queryAll(By.css('mat-card'));
    expect(days.length).toBe(7);
  });

  it('should highlight today\'s date', () => {
    component.daysOfMonth = [];
    component.loadFullMonth();
    fixture.detectChanges();
    const today = new Date().getDate();
    const todayCard = fixture.debugElement.query(By.css('.green'));
    expect(todayCard).toBeTruthy();
    expect(todayCard.nativeElement.textContent).toContain(today.toString());
  });
});