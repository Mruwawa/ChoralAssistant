import { Component, computed, inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AuthorizationService } from '../../../Services/authorization.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  @Input() disabledOnLoggedOut: boolean = false;

  private router = inject(Router);

  private authService = inject(AuthorizationService);
  
  userInfo = this.authService.userInfo;

  async login() {
    await this.authService.signIn();
  }

  async logout() {
    await this.authService.signOut();
    this.router.navigate(['/']);
  }
}
