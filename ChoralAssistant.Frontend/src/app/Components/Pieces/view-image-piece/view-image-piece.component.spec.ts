import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewImagePieceComponent } from './view-image-piece.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';

describe('ViewImagePieceComponent', () => {
  let component: ViewImagePieceComponent;
  let fixture: ComponentFixture<ViewImagePieceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewImagePieceComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewImagePieceComponent);
    component = fixture.componentInstance;
    component.piece = {
      title: 'string',
      description: 'string',
      audioUrl: 'string',
      thumbnailUrl: 'string',
      ownerUserGuid: 'string',
      storageFolderGuid: 'string',
      pageCount: 3,
      type: 'string'
    }
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
