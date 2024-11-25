import { Component, inject } from '@angular/core';
import { PieceViewModel } from '../../Models/piece-view-model';
import { PieceComponent } from "../piece/piece.component";
import { PieceStorageService } from '../../Services/piece-storage.service';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-piece-list',
  standalone: true,
  imports: [PieceComponent, MatButtonModule, MatIcon, MatProgressSpinnerModule],
  templateUrl: './piece-list.component.html',
  styleUrl: './piece-list.component.scss'
})
export class PieceListComponent {
  pieces: {
    id: string;
    name: string;
    thumbnailUrl: string;
  }[] = [];

  loading : boolean = true;

  private pieceStorageService = inject(PieceStorageService);

  private dialog = inject(MatDialog);

  ngOnInit() {
    const pieces = this.pieceStorageService.getAllPieces();

    pieces.subscribe(
      value => {
        this.pieces = value;
        this.loading = false;
      }
    );
  }

  addDocument() {
    this.dialog.open(FileUploadComponent,
      {
        width: '70%',
        height: '70%'
      }
    );
  }

  deletePiece(pieceId: string) {
    this.pieceStorageService.deleteFile(pieceId)
      .subscribe(
        {
          next: () => {
            this.pieces = this.pieces.filter(piece => piece.id !== pieceId);
          },
          error: (error) => {
            console.error('Error deleting piece', error);
          }
        }
      );
  }
}
