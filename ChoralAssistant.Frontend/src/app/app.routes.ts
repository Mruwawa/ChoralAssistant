import { Routes } from '@angular/router';
import { HomeComponent } from './Components/HomeFeature/home/home.component';
import { PieceListComponent } from './Components/Pieces/piece-list/piece-list.component';
import { ViewPieceComponent } from './Components/Pieces/view-piece/view-piece.component';
import { CalendarComponent } from './Components/CalendarFeature/calendar/calendar.component';
import { authGuard } from './Guards/auth.guard';
import { saveDrawingGuard } from './Guards/save-drawing.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'utwory', component: PieceListComponent, canActivate: [authGuard] },
    { path: 'utwor/:id', component: ViewPieceComponent, canActivate: [authGuard], canDeactivate: [saveDrawingGuard] },
    { path: 'kalendarz', component: CalendarComponent, canActivate: [authGuard] }
];
