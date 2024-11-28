import { Component, EventEmitter, inject, Input, input, Output } from '@angular/core';
import { PieceViewModel } from '../../../Models/piece-view-model';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardImage, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { Piece } from '../../../Models/piece';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteComponent } from '../../Shared/confirm-delete/confirm-delete.component';
import { PieceListing } from '../../../Models/piece-listing';
import { PieceStorageService } from '../../../Services/piece-storage.service';


@Component({
  selector: 'app-piece',
  standalone: true,
  imports: [MatCard, MatCardTitle, MatCardImage, MatCardActions, MatCardHeader, MatCardContent, MatIcon, MatButton, MatIconButton, MatMenuModule, RouterModule],
  templateUrl: './piece.component.html',
  styleUrl: './piece.component.scss'
})
export class PieceComponent {
  @Input() piece!: PieceListing;
  @Output() onDelete = new EventEmitter<number>();

  dialog = inject(MatDialog);
  private pieceStorageService = inject(PieceStorageService);

  ngOnInit() {
    if(!this.piece.thumbnailUrl) {
      this.pieceStorageService.getPieceThumbnail(this.piece.pieceId).subscribe({
        next: (thumbnailUrl) => {
          this.piece.thumbnailUrl = thumbnailUrl;
        },
        error: (error) => {
          console.error(error);
        }
      });
    }
  }

  deletePiece() {
    const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      width: '300px',
      height: '300px',
      data: { entityName: this.piece.title }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.onDelete.emit(this.piece.pieceId);
      }
    });
  }
}
