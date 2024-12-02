import { TestBed } from '@angular/core/testing';

import { PieceStorageService } from './piece-storage.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('PieceStorageService', () => {
  let service: PieceStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(PieceStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
