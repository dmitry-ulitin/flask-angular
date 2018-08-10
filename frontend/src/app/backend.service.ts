import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Account } from './models/account';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(private http: HttpClient) { }

  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>('/api/accounts');
  }

  getAccount(id: number): Observable<Account> {
    return this.http.get<Account>('/api/accounts/' + id);
  }

  saveAccount(account: Account): Observable<Account> {
    let headers = new HttpHeaders({'Content-Type':'application/json'});
    if (account.id) {
      return this.http.put<Account>('/api/accounts',account, { headers:headers});
    }
    return this.http.post<Account>('/api/accounts',account, { headers:headers});
  }

  deleteAccount(id: number): Observable<any> {
    return this.http.delete('/api/accounts/' + id);
  }
}
