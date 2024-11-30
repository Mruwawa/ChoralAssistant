import { Component, computed, effect, ElementRef, inject, Input, signal, ViewChild } from '@angular/core';
import { Piece } from '../../../Models/piece';
import { PieceStorageService } from '../../../Services/piece-storage.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { ColorPickerModule } from 'ngx-color-picker';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DrawingCanvasComponent } from '../drawing-canvas/drawing-canvas.component';
import { MatButtonModule } from '@angular/material/button';
import { DrawingSettings } from '../../../Models/drawing-settings';
import { DrawingControlsComponent } from '../drawing-controls/drawing-controls.component';

@Component({
  selector: 'app-view-image-piece',
  standalone: true,
  imports: [MatProgressSpinnerModule, MatIconModule, MatSliderModule, ColorPickerModule, FormsModule, MatSlideToggleModule, DrawingCanvasComponent, MatButtonModule, DrawingControlsComponent],
  templateUrl: './view-image-piece.component.html',
  styleUrl: './view-image-piece.component.scss'
})
export class ViewImagePieceComponent {
  @Input({ required: true }) piece!: Piece;
  @Input({ required: true }) pieceId!: number;

  drawingSettings: DrawingSettings = {
    drawingColor: '#000000',
    drawingWidth: 2,
    isErasing: false,
    eraserSize: 100,
    isDrawing: true
  }

  currentPage = signal(1);

  private pieceStorageService = inject(PieceStorageService);
  private sanitizer: DomSanitizer = inject(DomSanitizer);

  @ViewChild('imageContainer', { static: false }) container!: ElementRef<HTMLDivElement>;
  @ViewChild('drawingCanvas', { static: false }) drawingCanvas!: DrawingCanvasComponent;

  imagesLoading = computed(() => this.imageUrls().some(url => url === undefined) || this.imageUrls().length === 0);
  private imageUrls = signal<SafeResourceUrl[]>([]);
  currentImageUrl = computed(() => {
    return this.imageUrls()[this.currentPage() - 1];
  });

  imageLoaded = signal(false)

  canDeactivate() : boolean {
    this.drawingCanvas && this.drawingCanvas.canDeactivate();
    return true;
  }

  ngOnInit() {
    this.loadPages();
  }

  clearCanvas() {
    this.drawingCanvas && this.drawingCanvas.clearCanvas();
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

  onImageLoad() {
    this.imageLoaded.set(true);
  }

  loadPages() {
    this.imageUrls.update(value => new Array(this.piece.pageCount).fill(undefined));
    for (let i = 0; i < this.piece.pageCount; i++) {
      this.pieceStorageService.getPiecePageFile(this.pieceId, i + 1)
        .subscribe({
          next: (blob) => {
            const url = URL.createObjectURL(blob);
            this.imageUrls.update(value => {
              const copy = [...value];
              copy[i] = this.sanitizer.bypassSecurityTrustResourceUrl(url);
              return copy;
            });
          }
        });
    }
  }

}
