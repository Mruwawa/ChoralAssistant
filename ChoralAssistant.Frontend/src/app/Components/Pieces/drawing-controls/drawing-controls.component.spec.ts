import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawingControlsComponent } from './drawing-controls.component';

describe('DrawingControlsComponent', () => {
  let component: DrawingControlsComponent;
  let fixture: ComponentFixture<DrawingControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawingControlsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrawingControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
