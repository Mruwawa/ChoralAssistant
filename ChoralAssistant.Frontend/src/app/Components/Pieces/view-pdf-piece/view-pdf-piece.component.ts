import { Component, ElementRef, inject, Input, signal, ViewChild } from '@angular/core';
import { PieceStorageService } from '../../../Services/piece-storage.service';
import { Piece } from '../../../Models/piece';
import { DrawingCanvasComponent } from '../drawing-canvas/drawing-canvas.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DrawingControlsComponent } from '../drawing-controls/drawing-controls.component';
import { DrawingSettings } from '../../../Models/drawing-settings';

@Component({
  selector: 'app-view-pdf-piece',
  standalone: true,
  imports: [PdfViewerModule, DrawingCanvasComponent, MatProgressSpinner, MatIconModule, MatButtonModule, DrawingControlsComponent],
  templateUrl: './view-pdf-piece.component.html',
  styleUrl: './view-pdf-piece.component.scss'
})
export class ViewPdfPieceComponent {

  @Input({ required: true }) pieceId!: number;
  @Input({ required: true }) piece!: Piece;

  @ViewChild('pdfContainer', { static: false }) container!: ElementRef<HTMLDivElement>;
  @ViewChild('drawingCanvas', { static: false }) drawingCanvas!: DrawingCanvasComponent;

  pieceStorageService = inject(PieceStorageService);

  drawingSettings: DrawingSettings = {
    drawingColor: '#000000',
    drawingWidth: 2,
    isErasing: false,
    eraserSize: 100,
    isDrawing: true
  }

  pdfUrl: string = '';
  pdfLoaded = signal(false);

  currentPage = signal(1);

  pdfLoading = signal(true);

  ngOnInit() {
    this.loadPdf();
  }

  clearCanvas() {
    this.drawingCanvas && this.drawingCanvas.clearCanvas();
  }

  canDeactivate() : boolean {
    this.drawingCanvas && this.drawingCanvas.canDeactivate();
    return true;
  }

  loadPdf() {
    this.pieceStorageService.getPieceFile(this.pieceId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.pdfUrl = url;
        this.pdfLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading pdf', error);
      }
    });
  }

  onPdfLoaded(event: any) {
    this.pdfLoaded.set(true);
  }

  nextPage() {
    const nextPage = this.currentPage() + 1;
    if (nextPage > this.piece.pageCount) {
      this.changePage(1);
    } else {
      this.changePage(nextPage);
    }
  }

  previousPage() {
    const nextPage = this.currentPage() - 1;
    if (nextPage < 1) {
      this.changePage(this.piece.pageCount);
    } else {
      this.changePage(nextPage);
    }
  }

  changePage(page: number) {
    this.currentPage.set(page);
    this.drawingCanvas.changePage(page);
  }
}
