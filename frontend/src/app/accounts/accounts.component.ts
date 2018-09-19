import { Component, OnInit } from '@angular/core';
import { Observable} from 'rxjs';
import { Store } from '@ngrx/store';
import { State } from '../app.reducers'
import { Account } from '../models/account';

@Component({
  selector: 'app-accounts',
  templateUrl: '/accounts.component.html',
  styles: []
})
export class AccountsComponent implements OnInit {
  accounts$: Observable<Account[]>;
  selected$: Observable<Account>;
  constructor(private store: Store<State>) {}

  ngOnInit() {
    this.accounts$ = this.store.select('accounts', 'accounts');
    this.selected$ = this.store.select('accounts', 'selected');
  }

  refresh() {}

  select(a: Account) {
    this.store.dispatch({type:'[accounts] select', payload: a});    
  }

  create() {
    this.store.dispatch({type:'[accounts] create'});    
  }

  delete() {
    this.store.dispatch({type:'[accounts] delete'});    
  }
}
