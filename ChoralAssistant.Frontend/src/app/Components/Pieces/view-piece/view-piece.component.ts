import { Component, computed, effect, ElementRef, HostListener, inject, Signal, signal, ViewChild, WritableSignal } from '@angular/core';
import { PieceViewModel } from '../../../Models/piece-view-model';
import { ActivatedRoute } from '@angular/router';
import { PieceStorageService } from '../../../Services/piece-storage.service';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { Piece } from '../../../Models/piece';

@Component({
  selector: 'app-view-piece',
  standalone: true,
  imports: [PdfViewerModule, MatIconModule, MatButtonModule, MatSlideToggleModule, FormsModule, MatProgressSpinner],
  templateUrl: './view-piece.component.html',
  styleUrl: './view-piece.component.scss'
})
export class ViewPieceComponent {
  piece!: Piece
  pieceId!: number;

  @ViewChild('pdfContainer', { static: false }) pdfContainer!: ElementRef<HTMLCanvasElement>;
  @ViewChild('drawingCanvas', { static: false }) drawingCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cursorCanvas', { static: false }) cursorCanvas!: ElementRef<HTMLCanvasElement>;

  pieceStorageService: PieceStorageService = inject(PieceStorageService);
  sanitizer: DomSanitizer = inject(DomSanitizer);
  route: ActivatedRoute = inject(ActivatedRoute);

  currentPage: number = 1;

  loading: boolean = true;

  imageUrls: SafeResourceUrl[] = [];
  pdfUrl: string = '';
  audioUrl: SafeResourceUrl = '';

  private drawingCanvasContext!: CanvasRenderingContext2D;
  private cursorCanvasContext!: CanvasRenderingContext2D;
  private lastX = 0;
  private lastY = 0;
  private eraserSize: number = 50;

  private autoSaveTimeoutMs: number = 5000;
  private autoSaveIntervalId: any;

  isErasing: boolean = false;
  private mouseDown: boolean = false;

  private savedDrawings: { page: number, content: Blob | null, loading: WritableSignal<boolean> }[] = [];

  currentImageUrl: SafeResourceUrl = '';

  async ngOnInit() {
    this.pieceId = this.route.snapshot.params['id'];
    this.piece = await firstValueFrom(this.pieceStorageService.getPiece(this.pieceId));
    this.loadPages();
    this.getDrawings();
    this.loadAudioFile();
  }

  loadAudioFile() {
    if (this.piece == null) {
      return;
    }
    this.pieceStorageService.getPieceAudioFile(this.pieceId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.audioUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      },
      error: (error) => {
        console.error('Error loading audio', error);
      }
    });
  }

  async loadPages() {
    if (this.piece == null) {
      return;
    }
    this.loading = false;

    if (this.piece.type == 'image') {
      for (let i = 0; i < this.piece.pageCount; i++) {
        this.pieceStorageService.getPiecePageFile(this.pieceId, i + 1).subscribe({
          next: (blob) => {
            const url = URL.createObjectURL(blob);
            this.imageUrls[i] = this.sanitizer.bypassSecurityTrustResourceUrl(url);
            if (this.currentPage - 1 == i) {
              this.currentImageUrl = this.imageUrls[i];
              this.waitForImageToLoad();
            }
          },
          error: (error) => {
            console.error('Error loading page', error);
          }
        });
      }
    } else {
      this.pieceStorageService.getPieceFile(this.pieceId).subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          this.pdfUrl = url;
        },
        error: (error) => {
          console.error('Error loading pdf', error);
        }
      });
    }

    this.autoSaveIntervalId = window.setInterval(() => {
      this.saveDrawings()
    }
      , this.autoSaveTimeoutMs);
  }

  waitForImageToLoad() {
    let imageEl = document.querySelector(".imageContainer");
    if (imageEl == null) {
      window.setTimeout(() => this.waitForImageToLoad(), 100);
      return;
    }
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
    for (let i = 0; i < this.piece.pageCount; i++) {
      const blob = this.savedDrawings[i].content;
      if (blob) {
        this.pieceStorageService.saveDrawings(this.pieceId, i + 1, blob).subscribe({
          next: (response) => {
          },
          error: (error) => {
            console.error('Error saving drawings', error);
          }
        });
      }
    }
  }

  getDrawings() {
    for (let i = 0; i < this.piece.pageCount; i++) {
      this.savedDrawings[i] = { page: i + 1, content: null, loading: signal(true) };

      this.pieceStorageService.getDrawing(this.pieceId, i + 1).subscribe({
        next: (blob) => {
          if (!blob) {
            console.log('No drawing found for page', i);
            return;
          }
          this.savedDrawings[i].content = blob;
          if(i == this.currentPage - 1) {
            this.restoreCanvas(i);
          }
        },
        error: (error) => {
          console.error('Error loading drawings', error);
        }
      });
    }
  }

  async saveCanvas() {
    const canvas = this.drawingCanvas.nativeElement as HTMLCanvasElement;
    const blobPromise = new Promise<Blob | null>((resolve, reject) =>
      canvas.toBlob((blob) => resolve(blob), 'image/png'));
    const blob = await blobPromise;

    if (!blob)
      return;

    this.savedDrawings[this.currentPage - 1].content = blob;
  }

  async restoreCanvas(page: number) {
    const canvas = this.drawingCanvas.nativeElement as HTMLCanvasElement;
    const currentImageBlob = this.savedDrawings[this.currentPage - 1].content;
    if (currentImageBlob == null) { return }
    const dataUrl = URL.createObjectURL(currentImageBlob);
    this.drawingCanvasContext.clearRect(0, 0, canvas.width, canvas.height);
    if (dataUrl) {
      const img = new Image();
      img.onload = () => {
        this.drawingCanvasContext.drawImage(img, 0, 0);
        URL.revokeObjectURL(dataUrl);
      };
      img.src = dataUrl;
    }
  }

  async nextPage() {
    const nextPage = this.currentPage + 1;
    if (nextPage > this.piece.pageCount) {
      await this.changePage(1);
    } else {
      await this.changePage(nextPage);
    }
  }

  async previousPage() {
    const nextPage = this.currentPage - 1;
    if (nextPage < 1) {
      await this.changePage(this.piece.pageCount);
    } else {
      await this.changePage(nextPage);
    }
  }

  async changePage(page: number) {
    await this.saveCanvas();
    this.currentPage = page;
    this.currentImageUrl = this.imageUrls[this.currentPage - 1];
    this.restoreCanvas(page);
  }

  pdfLoaded(event: any) {
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
    this.restoreCanvas(this.currentPage);
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
