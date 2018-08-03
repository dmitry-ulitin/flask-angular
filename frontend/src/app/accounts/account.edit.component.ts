import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common'
import { Observable} from 'rxjs';
import { Store } from '@ngrx/store';
import { State } from '../app.reducers'
import { Account } from '../models/account';

@Component({
  selector: 'app-account-edit',
  templateUrl: '/account.edit.component.html',
  styles: []
})
export class AccountEditComponent implements OnInit {
  account$: Observable<Account>;
  constructor(private store: Store<State>, private location: Location) {}

  ngOnInit() {
    this.account$ = this.store.select('accounts', 'selected');
  }

  cancel() {
      this.location.back();
  }
}
