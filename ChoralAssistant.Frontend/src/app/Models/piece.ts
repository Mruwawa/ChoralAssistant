export interface Piece {
    title: string;
    description?: string;
    audioUrl?: string;
    thumbnailUrl: string;
    ownerUserGuid: string;
    storageFolderGuid: string;
    pageCount: number;
    type: string;
}