import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentPiecesComponent } from './recent-pieces.component';

describe('RecentPiecesComponent', () => {
  let component: RecentPiecesComponent;
  let fixture: ComponentFixture<RecentPiecesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentPiecesComponent]
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
