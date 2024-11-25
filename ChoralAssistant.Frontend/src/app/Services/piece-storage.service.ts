import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, from, map, Observable, of, switchMap } from 'rxjs';
import { PieceViewModel } from '../Models/piece-view-model';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { Drawings } from '../Models/drawings';
import { Piece } from '../Models/piece';

@Injectable({
  providedIn: 'root'
})
export class PieceStorageService {

  constructor() { }

  private httpClient: HttpClient = inject(HttpClient);
  private sanitizer: DomSanitizer = inject(DomSanitizer);

  getDrawings(pieceId: string): Observable<Drawings> {
    return this.httpClient.get(`/api/get-drawings/${pieceId}`).pipe(
      map((drawings: any) => {
        return {
          imageUrls: drawings.imageUrls
        };
      })
    );
  }

  saveDrawings(pieceId: string, drawings: Drawings): Observable<any> {
    return this.httpClient.post(`/api/save-drawings/${pieceId}`, drawings);
  }

  async getPiece(pieceId: string): Promise<PieceViewModel | null> {
    const pieceViewModel: PieceViewModel = 
    {
      id: "",
      name: "",
      type: "",
      imageUrls: [],
      fileUrl: "",
      audioFileUrl: "",
      audioLink: null
    };

    const piece = await this.httpClient.get<Piece>(`/api/get-piece/${pieceId}`).toPromise();

    if(piece == null) {
      return null;
    }
    
    if(piece.pdfFileId != null) {
      pieceViewModel.type = "pdf";
      const pdfData = await this.httpClient.get(`/api/download-file/${piece.pdfFileId}`, { responseType: 'blob' }).toPromise();
      if(pdfData != null) {
        const pdfUrl = URL.createObjectURL(pdfData);
        pieceViewModel.fileUrl = pdfUrl;
      }
    }

    if(piece.imageFileIds != null && piece.imageFileIds.length > 0) {
      pieceViewModel.type = "image";
      for(const imageFileId of piece.imageFileIds) {
        const imageData = await this.httpClient.get(`/api/download-file/${imageFileId}`, { responseType: 'blob' }).toPromise();
        if(imageData != null) {
          const imageUrl = URL.createObjectURL(imageData);
          pieceViewModel.imageUrls.push(this.sanitizer.bypassSecurityTrustResourceUrl(imageUrl));
        }
      }
    }

    if(piece.audioFileId != null) {
      const audioData = await this.httpClient.get(`/api/download-file/${piece.audioFileId}`, { responseType: 'blob' }).toPromise();
      if(audioData != null) {
        const audioUrl = URL.createObjectURL(audioData);
        pieceViewModel.audioFileUrl = audioUrl;
      }
    }

    if(pieceViewModel.audioLink != null) {
      pieceViewModel.audioLink = this.sanitizer.bypassSecurityTrustResourceUrl(piece.audioUrl);
    }
    return pieceViewModel;
  }

  getAllPieces(): Observable<{
    id: string;
    name: string;
    thumbnailUrl: string;
  }[]> {
    return this.httpClient.get("/api/get-all-pieces").pipe(
      map((pieces: any) => {
        return pieces.map((result: any) =>
        ({
          id: result.id,
          name: result.name,
          thumbnailUrl: result.thumbnailLink,
        }));
      }));
  }

  getAllPiecesMinimal(): Observable<{id: string, title: string}[]> 
  {
    return this.httpClient.get<{id: string, title: string}[]>("/api/get-all-pieces-minimal");    
  }

  deleteFile(fileId: string) {
    return this.httpClient.delete(`/api/delete-piece/${fileId}`);
  }
}

