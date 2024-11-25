import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { PieceViewModel } from '../../Models/piece-view-model';
import { ActivatedRoute } from '@angular/router';
import { PieceStorageService } from '../../Services/piece-storage.service';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-view-piece',
  standalone: true,
  imports: [PdfViewerModule, MatIconModule, MatButtonModule, MatSlideToggleModule, FormsModule, MatProgressSpinner],
  templateUrl: './view-piece.component.html',
  styleUrl: './view-piece.component.scss'
})
export class ViewPieceComponent {
  piece!: PieceViewModel
  pieceId!: string;

  @ViewChild('pdfContainer', { static: false }) pdfContainer!: ElementRef<HTMLCanvasElement>;
  // @ViewChild('imageContainer', { static: false }) imageContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('drawingCanvas', { static: false }) drawingCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cursorCanvas', { static: false }) cursorCanvas!: ElementRef<HTMLCanvasElement>;

  pieceStorageService: PieceStorageService = inject(PieceStorageService);
  sanitizer: DomSanitizer = inject(DomSanitizer);

  pdfData!: Blob | null;

  pageCount: number = 0;
  currentPage: number = 1;

  loading: boolean = true;

  private drawingCanvasContext!: CanvasRenderingContext2D;
  private cursorCanvasContext!: CanvasRenderingContext2D;
  private lastX = 0;
  private lastY = 0;
  private eraserSize: number = 50;

  private autoSaveTimeoutMs: number = 5000;
  private autoSaveIntervalId: any;

  isErasing: boolean = false;
  private mouseDown: boolean = false;

  private savedDrawings: Record<number, string> = {};

  currentImageUrl: SafeResourceUrl = '';

  constructor(route: ActivatedRoute) {
    route.params.subscribe(params => {
      this.pieceId = params['id'];

      this.piece = {
        id: "",
        name: "",
        type: "",
        imageUrls: [],
        fileUrl: "",
        audioFileUrl: "",
        audioLink: ""
      };

      this.pieceStorageService.getPiece(this.pieceId)
        .then((piece) => {
          if (piece == null) {
            return;
          }
          this.piece = piece;
          this.loading = false;

          if (this.piece.type == 'image') {
            this.currentImageUrl = this.piece.imageUrls[this.currentPage - 1];
            this.pageCount = this.piece.imageUrls.length;
            this.waitForImageToLoad();
          }
          this.autoSaveIntervalId = window.setInterval(() => {
            this.saveDrawings()
          }
            , this.autoSaveTimeoutMs);
        });

    });
  }

  waitForImageToLoad() {
    let imageEl = document.querySelector(".imageContainer");
    if (imageEl == null) {
      window.setTimeout(() => this.waitForImageToLoad(), 100);
      return;
    }
    console.log("Image loaded", imageEl);
    this.afterViewLoaded(imageEl as HTMLDivElement);
  }

  @HostListener('window:beforeunload')
  unload() {
    window.clearInterval(this.autoSaveIntervalId);
    this.saveDrawings();
  }

  canDeactivate() {
    window.clearInterval(this.autoSaveIntervalId);
    this.saveDrawings();
    return true;
  }

  saveDrawings() {
    this.saveCanvas();
    this.pieceStorageService.saveDrawings(this.pieceId, { imageUrls: this.savedDrawings }).subscribe({
      next: (response) => {
      },
      error: (error) => {
        console.error('Error saving drawings', error);
      }
    });
  }

  getDrawings() {
    this.pieceStorageService.getDrawings(this.pieceId).subscribe({
      next: (drawings) => {
        this.savedDrawings = drawings.imageUrls;
        this.restoreCanvas(this.currentPage);
      },
      error: (error) => {
        console.error('Error loading drawings', error);
      }
    });
  }

  saveCanvas() {
    const canvas = this.drawingCanvas.nativeElement as HTMLCanvasElement;
    this.savedDrawings[this.currentPage] = canvas.toDataURL();
  }

  restoreCanvas(page: number) {
    const canvas = this.drawingCanvas.nativeElement as HTMLCanvasElement;
    const dataUrl = this.savedDrawings[this.currentPage];
    this.drawingCanvasContext.clearRect(0, 0, canvas.width, canvas.height);
    if (dataUrl) {
      const img = new Image();
      img.onload = () => {
        this.drawingCanvasContext.drawImage(img, 0, 0);
      };
      img.src = dataUrl;
    }
  }

  nextPage() {
    const nextPage = this.currentPage + 1;
    if (nextPage > this.pageCount) {
      this.changePage(1);
    } else {
      this.changePage(nextPage);
    }
  }

  previousPage() {
    const nextPage = this.currentPage - 1;
    if (nextPage < 1) {
      this.changePage(this.pageCount);
    } else {
      this.changePage(nextPage);
    }
  }

  changePage(page: number) {
    this.saveCanvas();
    this.currentPage = page;
    this.currentImageUrl = this.piece.imageUrls[this.currentPage - 1];
    this.restoreCanvas(page);
  }

  pdfLoaded(event: any) {
    this.pageCount = event._pdfInfo.numPages
    this.afterViewLoaded(this.pdfContainer.nativeElement);
  }

  afterViewLoaded(containerElement: HTMLCanvasElement | HTMLDivElement) {
    const drawingCanvasEl = this.drawingCanvas.nativeElement;
    const cursorCanvasEl = this.cursorCanvas.nativeElement;

    drawingCanvasEl.width = containerElement.scrollWidth;
    drawingCanvasEl.height = containerElement.scrollHeight;

    cursorCanvasEl.width = containerElement.scrollWidth;
    cursorCanvasEl.height = containerElement.scrollHeight;

    new ResizeObserver(() => {
      drawingCanvasEl.width = containerElement.scrollWidth;
      drawingCanvasEl.height = containerElement.scrollHeight;
      cursorCanvasEl.width = containerElement.scrollWidth;
      cursorCanvasEl.height = containerElement.scrollHeight;
    }).observe(containerElement);

    this.drawingCanvasContext = drawingCanvasEl.getContext('2d')!;
    this.cursorCanvasContext = cursorCanvasEl.getContext('2d')!;
    this.setupDrawingCanvas();
    this.setupCursorCanvas(cursorCanvasEl);
    this.getDrawings();
  }

  setupDrawingCanvas() {
    this.drawingCanvasContext.strokeStyle = 'red';
    this.drawingCanvasContext.lineWidth = 2;
    this.drawingCanvasContext.lineJoin = 'round';
    this.drawingCanvasContext.lineCap = 'round';
  }

  setupCursorCanvas(canvas: HTMLCanvasElement) {
    canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    canvas.addEventListener('mousemove', (e) => this.moveCursor(e));
    canvas.addEventListener('mouseup', () => this.stopDrawing());
    canvas.addEventListener('mouseout', () => this.stopDrawing());
  }

  startDrawing(event: MouseEvent) {
    this.mouseDown = true;
    [this.lastX, this.lastY] = this.getMousePosition(event);
  }

  moveCursor(event: MouseEvent) {
    const [x, y] = this.getMousePosition(event);
    this.drawCursor();


    if (this.mouseDown) {
      if (this.isErasing) {
        this.drawingCanvasContext.clearRect(x - this.eraserSize / 2, y - this.eraserSize / 2, this.eraserSize, this.eraserSize);
      }
      else {
        this.drawingCanvasContext.beginPath();
        this.drawingCanvasContext.moveTo(this.lastX, this.lastY);
        this.drawingCanvasContext.lineTo(x, y);
        this.drawingCanvasContext.stroke();
      }
    }

    [this.lastX, this.lastY] = [x, y];
  }

  drawCursor() {
    const canvas = this.cursorCanvas.nativeElement as HTMLCanvasElement;

    this.cursorCanvasContext.clearRect(0, 0, canvas.width, canvas.height);
    if (this.isErasing) {
      this.cursorCanvasContext.beginPath();
      this.cursorCanvasContext.rect(
        this.lastX - this.eraserSize / 2,
        this.lastY - this.eraserSize / 2,
        this.eraserSize,
        this.eraserSize
      );
      this.cursorCanvasContext.strokeStyle = 'blue'; // Circle outline color
      this.cursorCanvasContext.lineWidth = 1; // Circle outline width
      this.cursorCanvasContext.stroke();
    }
    else {
      this.cursorCanvasContext.beginPath();
      this.cursorCanvasContext.arc(this.lastX, this.lastY, 2, 0, 2 * Math.PI);
      this.cursorCanvasContext.strokeStyle = 'black'; // Circle outline color
      this.cursorCanvasContext.lineWidth = 1; // Circle outline width
      this.cursorCanvasContext.stroke();
    }
  }

  stopDrawing() {
    this.mouseDown = false;
  }

  getMousePosition(event: MouseEvent): [number, number] {
    const canvas = this.cursorCanvas.nativeElement as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();

    return [
      event.clientX - rect.left,
      event.clientY - rect.top,
    ];
  }

  clearCanvas() {
    const canvas = this.drawingCanvas.nativeElement as HTMLCanvasElement;
    this.drawingCanvasContext.clearRect(0, 0, canvas.width, canvas.height);
  }


  toggleEraser() {
    this.isErasing = !this.isErasing;
  }

}
