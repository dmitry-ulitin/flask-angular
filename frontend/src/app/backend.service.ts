import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Account } from './models/account';
import { Category } from './models/category';
import { Transaction } from './models/transaction';

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

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>('/api/transactions');
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
