import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawingCanvasComponent } from './drawing-canvas.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DrawingCanvasComponent', () => {
  let component: DrawingCanvasComponent;
  let fixture: ComponentFixture<DrawingCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawingCanvasComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrawingCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
