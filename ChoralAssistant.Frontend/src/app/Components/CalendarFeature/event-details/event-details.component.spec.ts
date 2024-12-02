import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { EventDetailsComponent } from './event-details.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('EventDetailsComponent', () => {
  let component: EventDetailsComponent;
  let fixture: ComponentFixture<EventDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventDetailsComponent, HttpClientTestingModule],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' }), // Mock params if needed
            snapshot: {
              paramMap: {
                get: () => '123' // Mock paramMap.get() if needed
              }
            }
          }
        }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(EventDetailsComponent);
    component = fixture.componentInstance;
    component.eventDetails = {
      title: 'Choir Practice',
      description: 'Weekly choir practice session',
      start: '2023-10-01T18:00:00',
      end: '2023-10-01T20:00:00',
      location: 'Community Hall',
      pieces: [
        { id: 1, title: 'Hallelujah' },
        { id: 2, title: 'Amazing Grace' }
      ],
      id: '12345'
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
