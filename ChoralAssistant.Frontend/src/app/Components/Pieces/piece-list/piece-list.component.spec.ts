import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PieceListComponent } from './piece-list.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('PieceListComponent', () => {
  let component: PieceListComponent;
  let fixture: ComponentFixture<PieceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PieceListComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PieceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
