import { Component, inject, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { AuthorizationService } from '../../../Services/authorization.service';
import { UserData } from '../../../Models/user-data';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoginComponent } from "../../Shared/login/login.component";
import { UpcomingEventsComponent } from '../upcoming-events/upcoming-events.component';
import { RecentPiecesComponent } from '../recent-pieces/recent-pieces.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatCardModule, MatProgressSpinnerModule, LoginComponent, UpcomingEventsComponent, RecentPiecesComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  authService = inject(AuthorizationService);
  userInfo: Signal<UserData> = this.authService.userInfo;

  ngOnInit() {
  }
}
