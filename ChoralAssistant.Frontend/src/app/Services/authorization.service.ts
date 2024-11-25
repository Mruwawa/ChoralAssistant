import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { loadGapiInsideDOM } from 'gapi-script';
import { UserData } from '../Models/user-data';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {

  private authInstance!: gapi.auth2.GoogleAuth;
  private httpClient = inject(HttpClient);

  #userInfo = signal<UserData>({ isAuthorized: false, userId: null, userName: null, userPhotoUrl: null });
  userInfo = this.#userInfo.asReadonly();
  loading = signal(true);

  constructor() {
    this.initializeGapi();
    this.getUserInfo();
  }

  async initializeGapi() {
    const gapi = await loadGapiInsideDOM();

    gapi.load('auth2', () => {
      this.authInstance = gapi.auth2.init({
        client_id: import.meta.env.NG_APP_GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/calendar profile email'
      });
    });
  }

  async getUserInfo() {
    const userInfo = this.httpClient.get<
      {
        userId: string,
        userName: string,
        userPhotoUrl: string
      }>('/api/user/user-info', { observe: 'response' });

    userInfo.subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.status === 200) {
          this.#userInfo.set({
            isAuthorized: true,
            userId: response.body?.userId!,
            userName: response.body?.userName!,
            userPhotoUrl: response.body?.userPhotoUrl!
          });
        }
      },
      error: (error) => {
        this.loading.set(false);
        if (error.status === 401) {
          this.#userInfo.set({ isAuthorized: false, userId: null, userName: null, userPhotoUrl: null });
        }
      }
    });
  }

  async signIn() {
    const response = await this.authInstance.grantOfflineAccess();
    const userInfo = this.httpClient.post<
      {
        userId: string,
        userName: string,
        userPhotoUrl: string
      }>('/api/user/google-sign-in', { code: response.code }, { observe: 'response' });

    userInfo.subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.status === 200) {
          this.#userInfo.set({
            isAuthorized: true,
            userId: response.body?.userId!,
            userName: response.body?.userName!,
            userPhotoUrl: response.body?.userPhotoUrl!
          });
        }
      },
      error: (error) => {
        // console.error('Error getting user info: ', error);
        this.loading.set(false);
        if (error.status === 401) {
          this.#userInfo.set({ isAuthorized: false, userId: null, userName: null, userPhotoUrl: null });
        }
      }
    });
  }

  async signOut() {
    const logoutResponse = this.httpClient.post('/api/user/logout', {}, { observe: 'response' });

    logoutResponse.subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.status === 200) {
          this.#userInfo.set({ isAuthorized: false, userId: null, userName: null, userPhotoUrl: null });
        }
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Error logging out: ', error);
      }
    });
  }

}
