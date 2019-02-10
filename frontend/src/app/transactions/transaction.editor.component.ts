import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, combineLatest } from 'rxjs';
import { filter, tap, map } from 'rxjs/operators'
import { Store } from '@ngrx/store';
import { State } from '../app.reducers'
import { Account } from '../models/account';
import { Category } from '../models/category';
import { Transaction } from '../models/transaction';

@Component({
  selector: 'app-transaction-editor',
  template: '<app-transaction-form [data]="transaction$ | async" [accounts]="accounts$ | async" [income]="income$ | async" [expenses]="expenses$ | async" (save)="onSave($event)"></app-transaction-form>',
  styles: []
})
export class TransactionEditorComponent implements OnInit {
  transaction$: Observable<Transaction>;
  accounts$: Observable<Account[]>;
  expenses$: Observable<Category[]>;
  income$: Observable<Category[]>;
  constructor(private store: Store<State>, private route: ActivatedRoute, private location: Location, private fb: FormBuilder) { }

  ngOnInit() {
    this.route.params.pipe(filter(p => p['id'])).forEach(p => this.store.dispatch({ type: '[transaction] query id', payload: p['id'] }));

    this.transaction$ = this.store.select('transactions', 'form');

    this.accounts$ = this.store.select('accounts', 'accounts');
    this.expenses$ = this.store.select('categories', 'expenses');
    this.income$ = this.store.select('categories', 'income');
  }

  onSave(value: any) {
    this.store.dispatch({type: '[transaction] save', payload: value});
  }
}
