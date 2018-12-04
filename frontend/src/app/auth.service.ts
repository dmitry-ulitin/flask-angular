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
    this.currentUserSubject = new BehaviorSubject<string>(JSON.parse(localStorage.getItem('token')));
  }

  login(username: string, password: string) {
    return this.http.post<any>("/api/login", { username, password }).pipe(
      map(token => {
        if (token) {
          localStorage.setItem('token', token);
          this.currentUserSubject.next(token);
        }
        return token;
      })
    );
  }

  public get currentToken(): string {
    return this.currentUserSubject.value;
  }


  logout() {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }
}
