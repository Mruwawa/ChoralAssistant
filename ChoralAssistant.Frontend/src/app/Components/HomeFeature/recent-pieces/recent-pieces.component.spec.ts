import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentPiecesComponent } from './recent-pieces.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('RecentPiecesComponent', () => {
  let component: RecentPiecesComponent;
  let fixture: ComponentFixture<RecentPiecesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentPiecesComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecentPiecesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
