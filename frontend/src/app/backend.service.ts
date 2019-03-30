import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Account } from './models/account';
import { Category } from './models/category';
import { Transaction } from './models/transaction';
import { Filter } from './models/filter';
import { Group } from './models/group';
import { User } from './models/user';

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

  getTransactions(filter: Filter): Observable<Transaction[]> {
    let params = new HttpParams()
      .set('accounts', (filter.accounts || []).map(a => a.id).join(','))
      .set('categories', (filter.categories || []).map(a => a.id).join(','));
    if (filter.scope) {
      params = params.set('scope', '' + filter.scope);
    }
    return this.http.get<Transaction[]>('/api/transactions', {params: params});
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
}
