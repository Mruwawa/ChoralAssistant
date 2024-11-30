import { ChangeDetectorRef, Component, computed, effect, ElementRef, HostListener, inject, Signal, signal, viewChild, ViewChild, WritableSignal } from '@angular/core';
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
import { MatMenuModule } from '@angular/material/menu';
import { MatSliderModule } from '@angular/material/slider';
import { ColorPickerModule } from 'ngx-color-picker';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '../../Shared/confirm/confirm.component';
import { ViewImagePieceComponent } from '../view-image-piece/view-image-piece.component';
import { ViewPdfPieceComponent } from '../view-pdf-piece/view-pdf-piece.component';

@Component({
  selector: 'app-view-piece',
  standalone: true,
  imports: [PdfViewerModule, MatIconModule, MatButtonModule, MatSlideToggleModule, FormsModule, MatProgressSpinner, MatMenuModule, MatSliderModule, ColorPickerModule, ViewImagePieceComponent, ViewPdfPieceComponent],
  templateUrl: './view-piece.component.html',
  styleUrl: './view-piece.component.scss'
})
export class ViewPieceComponent {
  piece!: Piece
  pieceId!: number;

  @ViewChild('pdfContainer', { static: false }) pdfContainer!: ElementRef<HTMLCanvasElement>;
  @ViewChild('imageViewer') imageViewer!: ViewImagePieceComponent;
  @ViewChild('pdfViewer') pdfViewer!: ViewPdfPieceComponent;

  pieceStorageService: PieceStorageService = inject(PieceStorageService);
  sanitizer: DomSanitizer = inject(DomSanitizer);
  route: ActivatedRoute = inject(ActivatedRoute);

  currentPage = signal(1);

  loading: boolean = true;

  imageUrls: SafeResourceUrl[] = [];
  pdfUrl: string = '';
  audioUrl: SafeResourceUrl = '';

  async ngOnInit() {
    this.pieceId = this.route.snapshot.params['id'];
    this.piece = await firstValueFrom(this.pieceStorageService.getPiece(this.pieceId));
    this.loadAudioFile();
    this.pieceStorageService.addRecentPiece(this.pieceId);
    // this.loadPages();
    // this.getDrawings();
  }

  loadAudioFile() {
    if (this.piece == null) {
      return;
    }
    this.pieceStorageService.getPieceAudioFile(this.pieceId).subscribe({
      next: (blob) => {
        if (!blob) {
          return;
        }
        const url = URL.createObjectURL(blob);
        this.audioUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      },
      error: (error) => {
        console.error('Error loading audio', error);
      }
    });
  }

  // async loadPages() {

  //     this.pieceStorageService.getPieceFile(this.pieceId).subscribe({
  //       next: (blob) => {
  //         const url = URL.createObjectURL(blob);
  //         this.pdfUrl = url;
  //         this.loading = false;
  //       },
  //       error: (error) => {
  //         console.error('Error loading pdf', error);
  //       }
  //     });
    


  // }


  // @HostListener('window:beforeunload')
  // unload() {
  //   window.clearInterval(this.autoSaveIntervalId);
  //   this.saveDrawings();
  // }

  canDeactivate() {
    this.imageViewer && this.imageViewer.canDeactivate();
    this.pdfViewer && this.pdfViewer.canDeactivate();
    return true;
  }

  async nextPage() {
    const nextPage = this.currentPage() + 1;
    if (nextPage > this.piece.pageCount) {
      await this.changePage(1);
    } else {
      await this.changePage(nextPage);
    }
  }

  async previousPage() {
    const nextPage = this.currentPage() - 1;
    if (nextPage < 1) {
      await this.changePage(this.piece.pageCount);
    } else {
      await this.changePage(nextPage);
    }
  }

  async changePage(page: number) {
    // await this.saveCanvas();
    this.currentPage.set(page);
    // this.currentImageUrl = this.imageUrls[this.currentPage - 1];
    // this.restoreCanvas(page);
  }

  // pdfLoaded(event: any) {
  //   this.afterViewLoaded(this.pdfContainer.nativeElement);
  // }

  // afterViewLoaded(containerElement: HTMLCanvasElement | HTMLDivElement) {
  //   const drawingCanvasEl = this.drawingCanvas.nativeElement;
  //   const cursorCanvasEl = this.cursorCanvas.nativeElement;

  //   drawingCanvasEl.width = containerElement.scrollWidth;
  //   drawingCanvasEl.height = containerElement.scrollHeight;

  //   cursorCanvasEl.width = containerElement.scrollWidth;
  //   cursorCanvasEl.height = containerElement.scrollHeight;

  //   new ResizeObserver(async () => {
  //     if (this.drawingsLoaded) {
  //       await this.saveCanvas();
  //     }
  //     drawingCanvasEl.width = containerElement.clientWidth;
  //     drawingCanvasEl.height = containerElement.clientHeight;
  //     cursorCanvasEl.width = containerElement.clientWidth;
  //     cursorCanvasEl.height = containerElement.clientHeight;
  //     if (this.drawingsLoaded) {
  //       this.restoreCanvas(this.currentPage());
  //     }

  //   }).observe(containerElement);

  //   this.drawingCanvasContext = drawingCanvasEl.getContext('2d')!;
  //   this.cursorCanvasContext = cursorCanvasEl.getContext('2d')!;
  //   this.setupDrawingCanvas();
  //   this.setupCursorCanvas(cursorCanvasEl);
  //   if (this.piece.type != 'image') {
  //     console.log('restoring canvas after pdf loaded');
  //     this.restoreCanvas(this.currentPage());
  //   }
  // }

  // clearCanvas() {
  //   const canvas = this.drawingCanvas.nativeElement as HTMLCanvasElement;
  //   this.drawingCanvasContext.clearRect(0, 0, canvas.width, canvas.height);
  // }

  // clearCanvasConfirm() {
  //   const confirmDialog = this.dialog.open(ConfirmComponent, {
  //     data: {
  //       title: 'Wczyść kanwę',
  //       message: 'Czy na pewno chcesz wyczyścić zawartość kanwy?',
  //       noText: 'Anuluj',
  //       yesText: 'Potwierdź'
  //     }
  //   });
  //   confirmDialog.afterClosed().subscribe((result: boolean) => {
  //     if (result) {
  //       this.clearCanvas();
  //     }
  //   });
  // }


  // toggleEraser() {
  //   this.isErasing = !this.isErasing;
  // }

}
