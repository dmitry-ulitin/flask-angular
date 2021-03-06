import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<string>;

  constructor(private http: HttpClient) {
//    this.currentUserSubject = new BehaviorSubject<string>(JSON.parse(localStorage.getItem('token')));
    this.currentUserSubject = new BehaviorSubject<string>(localStorage.getItem('token'));
  }

  login(username: string, password: string) {
    return this.http.post<any>("/api/login", { username, password }).pipe(
      map(response => {
        if (response && response.access_token) {
          localStorage.setItem('token', response.access_token);
          this.currentUserSubject.next(response.access_token);
        }
        return response;
      })
    );
  }

  public get currentToken(): string {
    return this.currentUserSubject.value;
  }

  public get claims(): any {
    let base64Url = this.currentUserSubject.value.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  }


  logout() {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }
}
