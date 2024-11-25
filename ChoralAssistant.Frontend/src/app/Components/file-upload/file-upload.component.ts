import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [MatTabsModule, FormsModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss'
})
export class FileUploadComponent {
  private pdfFile!: File;
  private imageFiles!: File[];
  private audioFile!: File;

  private httpClient: HttpClient = inject(HttpClient);
  private dialogRef = inject(MatDialogRef<FileUploadComponent>);

  fileTabIndex: number = 0;
  audioTabIndex: number = 0;
  pieceName: string = '';
  audioLink: string = '';

  errorMessage: string = '';

  constructor() { }

  onPDFFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.pdfFile = input.files[0];
    };
  }

  onImageFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imageFiles = Array.from(input.files);
    }
  }

  onAudioFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.audioFile = input.files[0];
    }
  }

  submitPiece() {
    const formData = new FormData();
    this.errorMessage = '';

    if (this.pieceName === '') {
      this.errorMessage = 'Nazwa utworu jest wymagana';
      return;
    }

    if (this.fileTabIndex === 0 && !this.pdfFile) {
      this.errorMessage = 'Plik PDF jest wymagany';
      return;
    }

    if (this.fileTabIndex === 1 && (!this.imageFiles || this.imageFiles.length === 0)) {
      this.errorMessage = 'Obrazy są wymagane';
      return;
    }

    if (this.pieceName != '') {
      formData.append('pieceName', this.pieceName);
    }

    if (this.fileTabIndex === 0) {
      if (this.pdfFile) {
        formData.append('files', this.pdfFile);
        formData.append('fileType', 'pdf');
      }
    } else {
      if (this.imageFiles) {
        this.imageFiles.forEach(file => {
          formData.append('files', file);
        });
        formData.append('fileType', 'image');
      }
    }

    if (this.audioTabIndex === 0) {
      if (this.audioFile) {
        formData.append('audioFile', this.audioFile);
      }
    }
    else {
      if (this.audioLink) {
        formData.append('audioUrl', this.audioLink);
      }
    }

    this.httpClient.post('api/upload-piece', formData).subscribe(
      {
        next: () => {
          this.dialogRef.close();
        },
        error: (error) => {
          this.errorMessage = error.message;
          console.error(error);
        }
      }
    );
  }
}
