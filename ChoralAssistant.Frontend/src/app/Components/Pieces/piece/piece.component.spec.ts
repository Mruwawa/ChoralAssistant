import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { PieceComponent } from './piece.component';

describe('PieceComponent', () => {
  let component: PieceComponent;
  let fixture: ComponentFixture<PieceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PieceComponent, HttpClientTestingModule],
      providers: [
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

  
    fixture = TestBed.createComponent(PieceComponent);
    component = fixture.componentInstance;
    component.piece = {
      title: 'string',
      thumbnailUrl: 'string',
      pieceId: 4
    }
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
