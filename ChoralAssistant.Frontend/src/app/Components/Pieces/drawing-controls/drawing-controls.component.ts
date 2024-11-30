import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { ColorPickerModule } from 'ngx-color-picker';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '../../Shared/confirm/confirm.component';
import { DrawingSettings } from '../../../Models/drawing-settings';

@Component({
  selector: 'app-drawing-controls',
  standalone: true,
  imports: [MatIconModule, MatSliderModule, ColorPickerModule, FormsModule, MatSlideToggleModule],
  templateUrl: './drawing-controls.component.html',
  styleUrl: './drawing-controls.component.scss'
})
export class DrawingControlsComponent {  
  private dialog = inject(MatDialog);
  
  @Output() clearCanvas: EventEmitter<void> = new EventEmitter<void>();
  
  @Input() drawingSettings!: DrawingSettings;
  @Output() drawingSettingsChange = new EventEmitter<DrawingSettings>();

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
