import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthData} from './auth-data.model';
import {Subject} from 'rxjs';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  private token: string;
  private authStatusListener: Subject<boolean> = new Subject<boolean>();
  private tokenTimer: any;
  private userId: string;

  constructor(private http: HttpClient,
              private router: Router) {
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  createUser(email: string, password: string) {
    const url = 'http://localhost:8080/api/user/signup';
    const headers = new HttpHeaders().append('Content-Type', 'application/json');
    const user: AuthData = {email, password};
    this.http.post(url, user, {headers})
      .subscribe((response) => {
        console.log(response);
        this.router.navigate(['/login']);
      }, (error) => {
        this.authStatusListener.next(false);
        console.log(error);
      });
  }

  loginUser(email: string, password: string) {
    const url = 'http://localhost:8080/api/user/login';
    const headers = new HttpHeaders().append('Content-Type', 'application/json');
    const user: AuthData = {email, password};
    this.http.post<{ token: string, expiresIn: number, userId: string }>(url, user, {headers})
      .subscribe((response) => {
        this.token = response.token;
        if (response.token) {
          this.userId = response.userId;
          const expiresInDuration = response.expiresIn;
          this.setAuthTimer(expiresInDuration);
          this.isAuthenticated = true;
          this.authStatusListener.next(true);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
          this.saveAuthData(response.token, expirationDate, this.userId);
          this.router.navigate(['/']);
          console.log(response);
        }
      }, (error) => {
        console.log(error);
      });
  }

  getToken() {
    return this.token;
  }

  public getUserId() {
    return this.userId;
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(this.isAuthenticated);
    this.router.navigate(['/']);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.userId = null;
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expirationDate', expirationDate.toISOString());
    localStorage.setItem('userId', this.userId);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expirationDate');
    localStorage.removeItem('userId');
  }

  private setAuthTimer(duration: number) {
    console.log('Setting timer:  ' + duration);
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.setAuthTimer(expiresIn / 1000);
      this.userId = authInformation.userId;
      this.authStatusListener.next(true);
    } else {
      this.token = null;
      this.isAuthenticated = false;
      this.authStatusListener.next(false);
    }
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const expirationDate = localStorage.getItem('expirationDate');
    if (!token || !expirationDate) {
      return;
    } else {
      return {
        token,
        expirationDate: new Date(expirationDate),
        userId
      };
    }
  }
}
