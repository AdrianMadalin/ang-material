import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthData} from './auth-data.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {
  }

  createUser(email: string, password: string) {
    const url = 'http://localhost:8080/api/user/signup';
    const headers = new HttpHeaders().append('Content-Type', 'application/json');
    const user: AuthData = {email, password};
    this.http.post(url, user, {headers})
      .subscribe((response) => {
        console.log(response);
      }, (error) => {
        console.log(error);
      });
  }

  loginUser(email: string, password: string) {
    const url = 'http://localhost:8080/api/user/login';
    const headers = new HttpHeaders().append('Content-Type', 'application/json');
    const user: AuthData = {email, password};
    this.http.post(url, user, {headers})
      .subscribe((response) => {
        console.log(response);
      }, (error) => {
        console.log(error);
      });
  }
}
