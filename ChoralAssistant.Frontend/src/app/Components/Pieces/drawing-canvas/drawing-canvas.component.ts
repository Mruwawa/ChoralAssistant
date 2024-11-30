import { ChangeDetectorRef, Component, computed, effect, ElementRef, HostListener, inject, Input, signal, ViewChild } from '@angular/core';
import { PieceStorageService } from '../../../Services/piece-storage.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DrawingSettings } from '../../../Models/drawing-settings';

@Component({
  selector: 'app-drawing-canvas',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  templateUrl: './drawing-canvas.component.html',
  styleUrl: './drawing-canvas.component.scss'
})
export class DrawingCanvasComponent {
  mouseDown: boolean = false;
  private lastX = 0;
  private lastY = 0;

  @ViewChild('drawingCanvas', { static: false }) drawingCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cursorCanvas', { static: false }) cursorCanvas!: ElementRef<HTMLCanvasElement>;

  @Input({ required: true }) container!: ElementRef<HTMLDivElement>;
  @Input({ required: true }) pageCount!: number;
  @Input({ required: true }) pieceId!: number;
  @Input({ required: true }) drawingSettings: DrawingSettings = {
    drawingColor: '#000000',
    drawingWidth: 2,
    isErasing: false,
    eraserSize: 100
  }

  drawingsLoading = computed(() => this.drawingUrls().some(url => url === undefined) || this.drawingUrls().length === 0);
  private drawingUrls = signal<string[]>([]);
  currentDrawingDataUrl = computed(() => { return this.drawingUrls()[this.currentPage() - 1] });

  currentPage = signal(1);

  private drawingCanvasContext!: CanvasRenderingContext2D;
  private cursorCanvasContext!: CanvasRenderingContext2D;

  private pieceStorageService = inject(PieceStorageService);

  changeDetectorRef = inject(ChangeDetectorRef);

  intervalId: number = 0;

  ngOnInit() {
    this.loadDrawings();
  }

  constructor() {
    effect(() => {
      if (!this.drawingsLoading()) {
        this.changeDetectorRef.detectChanges();
        this.initCanvas();
      }
    });
  }

  clearCanvas() {
    this.drawingCanvasContext.clearRect(0, 0, this.drawingCanvas.nativeElement.width, this.drawingCanvas.nativeElement.height);
    this.saveCanvas();
  }

  loadDrawings() {
    this.drawingUrls.update(value => new Array(this.pageCount).fill(undefined));
    for (let i = 0; i < this.pageCount; i++) {
      this.pieceStorageService.getDrawing(this.pieceId, i + 1)
        .subscribe({
          next: (drawing) => {
            if(drawing) {

            const drawingDataUrl = URL.createObjectURL(drawing);
            this.drawingUrls.update(value => {
              const copy = [...value];
              copy[i] = drawingDataUrl;
              return copy;
            });
          }
          else {
            this.drawingUrls.update(value => {
              const copy = [...value];
              copy[i] = '';
              return copy;
            });
          }
          }
        });
    }
  }

  setupDrawingCanvas() {
    this.drawingCanvasContext.strokeStyle = this.drawingSettings.drawingColor;
    this.drawingCanvasContext.lineWidth = this.drawingSettings.drawingWidth;
    this.drawingCanvasContext.lineJoin = 'round';
    this.drawingCanvasContext.lineCap = 'round';
  }

  setupCursorCanvas(canvas: HTMLCanvasElement) {
    canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    canvas.addEventListener('mousemove', (e) => this.moveCursor(e));
    canvas.addEventListener('mouseup', () => this.stopDrawing());
    canvas.addEventListener('mouseout', () => this.stopDrawing());
    canvas.addEventListener('touchstart', (e) => this.startDrawing(e.touches[0]));
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault(); // Prevent scrolling when drawing
      this.moveCursor(e.touches[0]);
    });
    canvas.addEventListener('touchend', () => this.stopDrawing());
    canvas.addEventListener('touchcancel', () => this.stopDrawing());
  }

  startDrawing(event: MouseEvent | Touch) {

    this.mouseDown = true;
    [this.lastX, this.lastY] = this.getMousePosition(event);
  }

  moveCursor(event: MouseEvent | Touch) {
    const [x, y] = this.getMousePosition(event);
    this.drawCursor();


    if (this.mouseDown) {
      if (this.drawingSettings.isErasing) {
        this.drawingCanvasContext.clearRect(x - this.drawingSettings.eraserSize / 2, y - this.drawingSettings.eraserSize / 2, this.drawingSettings.eraserSize, this.drawingSettings.eraserSize);
      }
      else {
        this.drawingCanvasContext.beginPath();
        this.drawingCanvasContext.strokeStyle = this.drawingSettings.drawingColor;
        this.drawingCanvasContext.lineWidth = this.drawingSettings.drawingWidth;
        this.drawingCanvasContext.lineCap = "round"; // Ensures smooth, rounded line ends
        this.drawingCanvasContext.lineJoin = "round"; // Ensures smooth corners

        // Draw a line from the last position to the current position
        this.drawingCanvasContext.moveTo(this.lastX, this.lastY);
        this.drawingCanvasContext.lineTo(x, y);
        this.drawingCanvasContext.stroke();

        // Draw a circular arc at the current position to fill gaps between consecutive line segments
        this.drawingCanvasContext.beginPath();
        this.drawingCanvasContext.arc(x, y, this.drawingSettings.drawingWidth / 2, 0, 2 * Math.PI);
        this.drawingCanvasContext.fillStyle = this.drawingSettings.drawingColor;
        this.drawingCanvasContext.fill();
      }
    }

    [this.lastX, this.lastY] = [x, y];
  }

  drawCursor() {
    const canvas = this.cursorCanvas.nativeElement as HTMLCanvasElement;

    this.cursorCanvasContext.clearRect(0, 0, canvas.width, canvas.height);
    if (this.drawingSettings.isErasing) {
      this.cursorCanvasContext.beginPath();
      this.cursorCanvasContext.rect(
        this.lastX - this.drawingSettings.eraserSize / 2,
        this.lastY - this.drawingSettings.eraserSize / 2,
        this.drawingSettings.eraserSize,
        this.drawingSettings.eraserSize
      );
      this.cursorCanvasContext.strokeStyle = 'blue'; // Circle outline color
      this.cursorCanvasContext.lineWidth = 1; // Circle outline width
      this.cursorCanvasContext.stroke();
    }
    else {
      this.cursorCanvasContext.beginPath();
      this.cursorCanvasContext.arc(this.lastX, this.lastY, this.drawingSettings.drawingWidth / 2, 0, 2 * Math.PI);
      this.cursorCanvasContext.fillStyle = this.drawingSettings.drawingColor; // Circle fill color
      this.cursorCanvasContext.fill();
    }
  }

  stopDrawing() {
    this.mouseDown = false;
  }

  getMousePosition(event: MouseEvent | Touch): [number, number] {
    const canvas = this.cursorCanvas.nativeElement as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();

    return [
      event.clientX - rect.left,
      event.clientY - rect.top,
    ];
  }

  initCanvas() {
    const drawingCanvasEl = this.drawingCanvas.nativeElement;
    const cursorCanvasEl = this.cursorCanvas.nativeElement;
    const conainerEl = this.container.nativeElement;

    new ResizeObserver(() => {
      this.saveCanvas();
      drawingCanvasEl.width = conainerEl.clientWidth;
      drawingCanvasEl.height = conainerEl.clientHeight;
      cursorCanvasEl.width = conainerEl.clientWidth;
      cursorCanvasEl.height = conainerEl.clientHeight;
      this.restoreCanvasWithScale();
    }).observe(conainerEl);

    this.drawingCanvasContext = drawingCanvasEl.getContext('2d')!;
    this.cursorCanvasContext = cursorCanvasEl.getContext('2d')!;
    this.restoreCanvas();
    this.setupDrawingCanvas();
    this.setupCursorCanvas(cursorCanvasEl);

    this.intervalId = window.setInterval(() => {
      this.saveDrawings();
    }, 1000);
  }

  @HostListener('window:beforeunload')
  unload() {
    window.clearInterval(this.intervalId);
    this.saveDrawings();
  }

  saveCanvas() {
    const canvas = this.drawingCanvas.nativeElement;
    const dataUrl = canvas.toDataURL();
    this.drawingUrls()[this.currentPage() - 1] = dataUrl;
  }

  restoreCanvas() {
    const url = this.currentDrawingDataUrl();
    if (url) {
      const img = new Image();
      img.onload = () => {
        const canvas = this.drawingCanvas.nativeElement as HTMLCanvasElement;
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        this.drawingCanvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
        this.drawingCanvasContext.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      };
      img.src = url;
    }
  }

  restoreCanvasWithScale() {
    const url = this.currentDrawingDataUrl();
    if (url) {
      const img = new Image();
      img.onload = () => {
        const canvas = this.drawingCanvas.nativeElement as HTMLCanvasElement;
        const imgWidth = img.width;
        const imgHeight = img.height;
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const scaleX = canvasWidth / imgWidth;
        const scaleY = canvasHeight / imgHeight;
        this.drawingCanvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
        this.drawingCanvasContext.drawImage(img, 0, 0, imgWidth * scaleX, imgHeight * scaleY);
      };
      img.src = url;
    }
  }

  changePage(page: number) {
    this.saveCanvas();
    this.currentPage.set(page);
    this.restoreCanvas();
  }

  canDeactivate(): boolean {
    window.clearInterval(this.intervalId);
    this.saveCanvas();
    return true;
  }

  saveDrawings() {
    this.saveCanvas();
    for (let i = 0; i < this.pageCount; i++) {
      const url = this.drawingUrls()[i];
      if (!url) continue;
      this.urlToBlob(url)
        .then(blob => {
          if (blob) {
            this.pieceStorageService.saveDrawings(this.pieceId, i + 1, blob).subscribe({
              next: (response) => {
              },
              error: (error) => {
                console.error('Error saving drawings', error);
              }
            });
          }
        });
    }
  }


  urlToBlob(url: string): Promise<Blob> {
    if (url.startsWith('data:')) {
      // It's a data URL - synchronously convert it to Blob
      return Promise.resolve(this.dataUrlToBlob(url));
    } else if (url.startsWith('blob:')) {
      // It's an object URL (Blob URL) - fetch and return as a Blob
      return fetch(url)
        .then(response => response.blob())
        .catch(error => {
          console.error('Error fetching object URL:', error);
          throw error;
        });
    } else {
      return Promise.reject(new Error('Unsupported URL type'));
    }
  }

  dataUrlToBlob(dataUrl: string): Blob {
    // Split the data URL into the prefix and the base64 data
    const [prefix, base64] = dataUrl.split(',');
    const byteCharacters = atob(base64); // Decode base64 to a string of binary characters

    // Create an array to hold the byte data
    const byteArrays: Uint8Array[] = [];

    // Convert each character into a byte
    for (let offset = 0; offset < byteCharacters.length; offset++) {
      const byte = byteCharacters.charCodeAt(offset);
      byteArrays.push(new Uint8Array([byte]));
    }

    // Combine all byte arrays into a single array and return as a Blob
    return new Blob(byteArrays, { type: prefix.split(':')[1].split(';')[0] }); // Set MIME type
  }
}