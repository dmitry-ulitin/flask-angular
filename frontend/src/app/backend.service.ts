import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Account } from './models/account';
import { Category } from './models/category';
import { Transaction } from './models/transaction';
import { Filter, Filters } from './models/filter';
import { Group } from './models/group';
import { User } from './models/user';
import { Amount } from './models/balance';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(private http: HttpClient) { }

  getUserNames(name: string, limit: number): Observable<User[]> {
    let params = new HttpParams()
      .set('name', name)
      .set('limit', limit + '');
    return this.http.get<User[]>('/api/users');
  }

  getGroups(): Observable<Group[]> {
    return this.http.get<Group[]>('/api/groups');
  }

  getGroup(id: number): Observable<Group> {
    return this.http.get<Group>('/api/groups/' + id);
  }

  saveGroup(group: Group): Observable<Group> {
    let headers = new HttpHeaders({'Content-Type':'application/json'});
    if (group.id) {
      return this.http.put<Group>('/api/groups', group, { headers:headers});
    }
    return this.http.post<Group>('/api/groups', group, { headers:headers});
  }

  deleteGroup(id: number): Observable<any> {
    return this.http.delete('/api/groups/' + id);
  }

  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>('/api/accounts');
  }

  getAccount(id: number): Observable<Account> {
    return this.http.get<Account>('/api/accounts/' + id);
  }

  saveAccount(account: Account): Observable<Account> {
    let headers = new HttpHeaders({'Content-Type':'application/json'});
    if (account.id) {
      return this.http.put<Account>('/api/accounts', account, { headers:headers});
    }
    return this.http.post<Account>('/api/accounts', account, { headers:headers});
  }

  deleteAccount(id: number): Observable<any> {
    return this.http.delete('/api/accounts/' + id);
  }

  getExpenses(): Observable<Category[]> {
    return this.http.get<Category[]>('/api/categories/expenses');
  }

  getIncome(): Observable<Category[]> {
    return this.http.get<Category[]>('/api/categories/income');
  }

  saveCategory(сategory: Category): Observable<Category> {
    let headers = new HttpHeaders({'Content-Type':'application/json'});
    if (сategory.id) {
      return this.http.put<Category>('/api/categories',сategory, { headers:headers});
    }
    return this.http.post<Category>('/api/categories',сategory, { headers:headers});
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete('/api/categories/' + id);
  }

  getTransactions(filters: Filters, offset: number, limit: number): Observable<Transaction[]> {
    let params = new HttpParams();
    params = params.set('limit', String(limit)).set('offset', String(offset));
    for(let filter of filters.filters) {
      if (filter.accounts) {
        params = params.set('accounts', (filter.accounts || []).map(a => a.id).join(','));
      }
      if (filter.categories) {
        params = params.set('categories', (filter.categories || []).map(c => c.id).join(','));
      }
      if (filter.scope) {
        params = params.set('scope', '' + filter.scope);
      }
      if (filter.period && filter.period.start) {
        params = params.set('start', filter.period.start);
      }
      if (filter.period && filter.period.finish) {
        params = params.set('finish', filter.period.finish);
      }
    }
    return this.http.get<Transaction[]>('/api/transactions', {params: params});
  }

  getSummary(filters: Filters): Observable<Amount> {
    let params = new HttpParams();
    for(let filter of filters.filters) {
      if (filter.accounts) {
        params = params.set('accounts', (filter.accounts || []).map(a => a.id).join(','));
      }
      if (filter.categories) {
        params = params.set('categories', (filter.categories || []).map(c => c.id).join(','));
      }
      if (filter.scope) {
        params = params.set('scope', '' + filter.scope);
      }
      if (filter.period && filter.period.start) {
        params = params.set('start', filter.period.start);
      }
      if (filter.period && filter.period.finish) {
        params = params.set('finish', filter.period.finish);
      }
    }
    return this.http.get<Amount>('/api/transactions/summary', {params: params});
  }

  getTransaction(id: number): Observable<Transaction> {
    return this.http.get<Transaction>('/api/transactions/' + id);
  }

  saveTransaction(transaction: Transaction): Observable<Transaction> {
    let headers = new HttpHeaders({'Content-Type':'application/json'});
    if (transaction.id) {
      return this.http.put<Transaction>('/api/transactions',transaction, { headers:headers});
    }
    return this.http.post<Transaction>('/api/transactions',transaction, { headers:headers});
  }

  deleteTransaction(id: number): Observable<any> {
    return this.http.delete('/api/transactions/' + id);
  }

  convert(value: number, currency: string, target: string): Observable<number> {
    let params = new HttpParams().set('value', (value || 0).toString()).set('currency', currency).set('target', target);
    return this.http.get<number>('/api/convert', {params: params});
  }
}
