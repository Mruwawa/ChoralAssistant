import { TestBed } from '@angular/core/testing';

import { PieceStorageService } from './piece-storage.service';

describe('PieceStorageService', () => {
  let service: PieceStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PieceStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
