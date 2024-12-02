import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpcomingEventsComponent } from './upcoming-events.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('UpcomingEventsComponent', () => {
  let component: UpcomingEventsComponent;
  let fixture: ComponentFixture<UpcomingEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpcomingEventsComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpcomingEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
