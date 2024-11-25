import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportCalendarDialogComponent } from './export-calendar-dialog.component';

describe('ExportCalendarDialogComponent', () => {
  let component: ExportCalendarDialogComponent;
  let fixture: ComponentFixture<ExportCalendarDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportCalendarDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportCalendarDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
