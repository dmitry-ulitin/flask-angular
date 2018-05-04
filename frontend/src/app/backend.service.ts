import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Account } from './models/account';

@Injectable()
export class BackendService {

  constructor(private http: HttpClient) { }

  getAccounts(): Promise<Account[]> {
    return this.http.get<Account[]>('/api/accounts').toPromise();
  }
}
