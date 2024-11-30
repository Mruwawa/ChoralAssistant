import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewImagePieceComponent } from './view-image-piece.component';

describe('ViewImagePieceComponent', () => {
  let component: ViewImagePieceComponent;
  let fixture: ComponentFixture<ViewImagePieceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewImagePieceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewImagePieceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
