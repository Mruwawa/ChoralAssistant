import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPieceComponent } from './view-piece.component';

describe('ViewPieceComponent', () => {
  let component: ViewPieceComponent;
  let fixture: ComponentFixture<ViewPieceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPieceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewPieceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
