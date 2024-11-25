import { Routes } from '@angular/router';
import { HomeComponent } from './Components/home/home.component';
import { PieceListComponent } from './Components/piece-list/piece-list.component';
import { ViewPieceComponent } from './Components/view-piece/view-piece.component';
import { CalendarComponent } from './Components/calendar/calendar.component';
import { authGuard } from './Guards/auth.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'utwory', component: PieceListComponent, canActivate: [authGuard] },
    { path: 'utwor/:id', component: ViewPieceComponent, canActivate: [authGuard] },
    { path: 'kalendarz', component: CalendarComponent, canActivate: [authGuard] }
];
