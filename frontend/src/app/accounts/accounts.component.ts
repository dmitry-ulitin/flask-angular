import { Component, OnInit } from '@angular/core';
import { Observable} from 'rxjs';
import { Store } from '@ngrx/store';
import { State } from '../app.reducers'
import { Account } from '../models/account';

@Component({
  selector: 'app-accounts',
  template: `
    <table>
    <tr *ngFor="let a of accounts$ | async">
      <td>{{a.name}}</td>
      <td>{{a.balance}} {{a.currency}}</td>
    </tr>
    </table>
  `,
  styles: []
})
export class AccountsComponent implements OnInit {
  accounts$: Observable<Account[]>;
  constructor(private store: Store<State>) {}

  ngOnInit() {
    this.store.dispatch({ type: '[accounts] query'});
    this.accounts$ = this.store.select('accounts', 'accounts');
  }
}
