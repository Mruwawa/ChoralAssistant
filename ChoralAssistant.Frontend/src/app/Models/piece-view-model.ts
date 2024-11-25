import { SafeResourceUrl, SafeUrl } from "@angular/platform-browser";

export interface PieceViewModel
{
    id: string;
    name: string;
    type: string;
    imageUrls: SafeResourceUrl[];
    fileUrl: string;
    audioFileUrl: SafeResourceUrl;
    audioLink: SafeResourceUrl | null;
}