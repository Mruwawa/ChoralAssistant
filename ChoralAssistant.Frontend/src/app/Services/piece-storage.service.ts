import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, from, map, Observable, of, switchMap } from 'rxjs';
import { PieceViewModel } from '../Models/piece-view-model';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { Drawings } from '../Models/drawings';
import { Piece } from '../Models/piece';
import { PieceListing } from '../Models/piece-listing';

@Injectable({
  providedIn: 'root'
})
export class PieceStorageService {

  constructor() { }

  private httpClient: HttpClient = inject(HttpClient);
  private sanitizer: DomSanitizer = inject(DomSanitizer);

  getPieceThumbnail(pieceId: number): Observable<string>
  {
    return this.httpClient.get<string>(`/api/get-save-thumbnail/${pieceId}`);
  }

  getDrawing(pieceId: number, page: number): Observable<Blob> {
    return this.httpClient.get(`/api/get-drawings/${pieceId}/${page}`, { responseType: 'blob' });
  }

  saveDrawings(pieceId: number, page: number, drawingsFile: Blob): Observable<any> {
    const formData = new FormData();
    formData.append('drawings', drawingsFile);

    return this.httpClient.post(`/api/save-drawings/${pieceId}/${page}`, formData);
  }

  getPiece(pieceId: number): Observable<Piece> {
    return this.httpClient.get<Piece>(`/api/get-piece/${pieceId}`);
  }

  getPieceFile(pieceId: number): Observable<Blob> {
    return this.httpClient.get(`/api/download-notes-file/${pieceId}`, { responseType: 'blob' });
  }

  getPiecePageFile(pieceId: number, page: number): Observable<Blob> {
    console.log("Getting page file", page);
    return this.httpClient.get(`/api/download-notes-page-file/${pieceId}/${page}`, { responseType: 'blob' });
  }

  listAllPieces(): Observable<PieceListing[]> {
    return this.httpClient.get<PieceListing[]>("/api/list-pieces");
  }

  deleteFile(pieceId: number) {
    return this.httpClient.delete(`/api/delete-piece/${pieceId}`);
  }

  getPieceAudioFile(pieceId: number) {
    return this.httpClient.get(`/api/download-audio-file/${pieceId}`, { responseType: 'blob' });
  }
}

