import { Component, OnInit } from '@angular/core';
import { Observable} from 'rxjs';
import { Store } from '@ngrx/store';
import { State } from '../app.reducers'
import { Transaction } from '../models/transaction';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styles: []
})
export class TransactionsComponent implements OnInit {
  transactions$: Observable<Transaction[]>;
  selected$: Observable<Transaction>;
  constructor(private store: Store<State>) {}

  ngOnInit() {
    this.transactions$ = this.store.select('transactions', 'transactions');
    this.selected$ = this.store.select('transactions', 'selected');
  }

  refresh() {
    this.store.dispatch({type:'[transactions] query'});
  }

  select(a: Transaction) {
    this.store.dispatch({type:'[transactions] select', payload: a});    
  }

  create() {
    this.store.dispatch({type:'[transactions] create'});
  }

  delete() {
    this.store.dispatch({type:'[transactions] delete'});    
  }
}
