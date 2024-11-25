import { Component, EventEmitter, inject, Input, input, Output } from '@angular/core';
import { PieceViewModel } from '../../Models/piece-view-model';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardImage, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { Piece } from '../../Models/piece';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteComponent } from '../confirm-delete/confirm-delete.component';


@Component({
  selector: 'app-piece',
  standalone: true,
  imports: [MatCard, MatCardTitle, MatCardImage, MatCardActions, MatCardHeader, MatCardContent, MatIcon, MatButton, MatIconButton, MatMenuModule, RouterModule],
  templateUrl: './piece.component.html',
  styleUrl: './piece.component.scss'
})
export class PieceComponent {
  @Input() piece!: {
    id: string;
    name: string;
    thumbnailUrl: string;
  };
  @Output() onDelete = new EventEmitter<string>();

  dialog = inject(MatDialog);

  ngOnInit() {
  }

  deletePiece() {
    const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      width: '300px',
      height: '300px',
      data: { entityName: this.piece.name }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.onDelete.emit(this.piece.id);
      }
    });
  }
}
