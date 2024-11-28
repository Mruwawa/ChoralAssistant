import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportCalendarDialogComponent } from './import-calendar-dialog.component';

describe('ImportCalendarDialogComponent', () => {
  let component: ImportCalendarDialogComponent;
  let fixture: ComponentFixture<ImportCalendarDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportCalendarDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportCalendarDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
