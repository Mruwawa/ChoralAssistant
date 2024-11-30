import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { ColorPickerModule } from 'ngx-color-picker';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '../../Shared/confirm/confirm.component';
import { DrawingSettings } from '../../../Models/drawing-settings';
import { MatIcon } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-drawing-controls',
  standalone: true,
  imports: [MatIconModule, MatSliderModule, ColorPickerModule, FormsModule, MatSlideToggleModule, MatIcon, MatDividerModule],
  templateUrl: './drawing-controls.component.html',
  styleUrl: './drawing-controls.component.scss'
})
export class DrawingControlsComponent {
  private dialog = inject(MatDialog);
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);

  @Output() clearCanvas: EventEmitter<void> = new EventEmitter<void>();

  @Input() drawingSettings: DrawingSettings = {
    isErasing: false,
    eraserSize: 50,
    isDrawing: false,
    drawingColor: '#000000',
    drawingWidth: 2,
  }
  @Output() drawingSettingsChange = new EventEmitter<DrawingSettings>();

  constructor() {
    this.iconRegistry.addSvgIcon(
      'eraser',
      this.sanitizer.bypassSecurityTrustResourceUrl('eraser-icon.svg')
    );
    this.iconRegistry.addSvgIcon(
      'clear',
      this.sanitizer.bypassSecurityTrustResourceUrl('clear-icon.svg')
    );
  }

  changeSize() {
    this.drawingSettings.eraserSize = this.drawingSettings.drawingWidth + 40;
  }

  toggleEdit() {
    this.drawingSettings.isDrawing = !this.drawingSettings.isDrawing;
    if(this.drawingSettings.isDrawing) {
      this.drawingSettings.isErasing = false;
    }
  }

  toggleEraser() {
    this.drawingSettings.isErasing = !this.drawingSettings.isErasing;
    if(this.drawingSettings.isErasing) {
      this.drawingSettings.isDrawing = false;
    }
  }

  clearCanvasConfirm() {
    const confirmDialog = this.dialog.open(ConfirmComponent, {
      data: {
        title: 'Wyczyść kanwę',
        message: 'Czy na pewno chcesz wyczyścić zawartość kanwy?',
        noText: 'Anuluj',
        yesText: 'Potwierdź'
      }
    });
    confirmDialog.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.emitClearCanvas();
      }
    });
  }

  emitClearCanvas() {
    this.clearCanvas.emit();
  }
}
