import { Component, OnInit } from '@angular/core';
import { Observable} from 'rxjs';
import { Store } from '@ngrx/store';
import { State } from '../app.reducers'
import { Account } from '../models/account';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styles: []
})
export class AccountsComponent implements OnInit {
  accounts$: Observable<Account[]>;
  selected$: Observable<Account>;
  constructor(private store: Store<State>) {}

  ngOnInit() {
    this.accounts$ = this.store.select('accounts', 'accounts').pipe(map(a => a.filter(t => t.visible)));
    this.selected$ = this.store.select('accounts', 'selected');
  }

  refresh() {
    this.store.dispatch({type:'[accounts] query'});
  }

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
