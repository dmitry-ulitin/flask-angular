import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Account } from './models/account';

@Injectable()
export class BackendService {

  constructor(private http: HttpClient) { }

  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>('/api/accounts');
  }

  saveAccount(account: Account): Observable<Account> {
    return this.http.post<Account>('/api/accounts',account, { headers:new HttpHeaders({'Content-Type':'application/json'})});
  }

  deleteAccount(id: number): Observable<any> {
    return this.http.delete('/api/accounts/' + id);
  }
}
