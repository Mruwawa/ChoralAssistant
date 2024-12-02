import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPdfPieceComponent } from './view-pdf-piece.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ViewPdfPieceComponent', () => {
  let component: ViewPdfPieceComponent;
  let fixture: ComponentFixture<ViewPdfPieceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPdfPieceComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewPdfPieceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
