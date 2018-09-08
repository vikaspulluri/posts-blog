import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { config } from '../app.config';
import { AuthData } from './auth-data.model';
import { User } from './user.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({providedIn: 'root'})
export class AuthService {
  private token;
  private authStatusListener = new Subject<boolean>();
  private isAuthenticated = false;
  private tokenTimer: any;
  private userId;

  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getUserId() {
    return this.userId;
  }

  createUser(user: User) {
    const userData: User = {firstName: user.firstName, lastName: user.lastName, email: user.email, password: user.password};
    this.http.post(`${config.apiUrl}/api/user/signup`, userData)
              .subscribe(response => {
                this.router.navigate(['/']);
              }, error => {
                this.authStatusListener.next(false);
              });
  }
  login(email: string, password: string) {
    const authData: AuthData = {email: email, password: password};
    this.http.post<{error: boolean,
                    token: string,
                    username: string,
                    expiresIn: number,
                    userId: string}>(`${config.apiUrl}/api/user/login`, authData)
              .subscribe(response => {
                if (response && response.token) {
                  const expiresInDuration = response.expiresIn;
                  this.token = response.token;
                  this.isAuthenticated = true;
                  this.userId = response.userId;
                  this.setAuthTimer(expiresInDuration);
                  const now = new Date();
                  const expiration = new Date(now.getTime() + expiresInDuration * 1000);
                  this.saveAuthData(this.token, expiration, response.userId);
                  this.authStatusListener.next(true);
                  this.router.navigate(['/']);
                }
              }, error => {
                this.authStatusListener.next(false);
              });
  }
  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.clearAuthData();
    clearTimeout(this.tokenTimer);
    this.userId = null;
    this.router.navigate(['/']);
  }

  autoAuthUser() {
    const authInfo = this.getAuthData();
    if (!authInfo) {
      return;
    }
    const now = new Date();
    const expiresIn = authInfo.expiration.getTime() - now.getTime();
    if (expiresIn) {
      this.token = authInfo.token;
      this.isAuthenticated = true;
      this.userId = authInfo.userId;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expiration = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    if (!token || !expiration) {
      return;
    }
    return {
      token: token,
      expiration: new Date(expiration),
      userId: userId
    };
  }
}
