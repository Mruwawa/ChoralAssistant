import { Component, inject } from '@angular/core';
import { PieceStorageService } from '../../../Services/piece-storage.service';
import { PieceListing } from '../../../Models/piece-listing';
import { MatCardModule } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recent-pieces',
  standalone: true,
  imports: [MatCardModule, MatDivider, RouterLink],
  templateUrl: './recent-pieces.component.html',
  styleUrl: './recent-pieces.component.scss'
})
export class RecentPiecesComponent {
  private pieceStorageService = inject(PieceStorageService);

  recentPieces: PieceListing[] = [];

  ngOnInit() {
    this.pieceStorageService.getRecentPieces();
    this.pieceStorageService.getRecentPieces().subscribe({
      next: (pieces) => {
        this.recentPieces = pieces;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }
}
