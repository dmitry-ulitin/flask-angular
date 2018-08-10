import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common'
import { Observable} from 'rxjs';
import { tap, filter } from 'rxjs/operators'
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
  form: FormGroup;
  constructor(private store: Store<State>, private route: ActivatedRoute, private location: Location, private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      currency: ['', Validators.required],
      start_balance: [],
      balance: [],
      hidden: [false]
    });
    this.account$ = this.store.select('accounts', 'selected').pipe(filter(a => a != null), tap(a => this.form.patchValue(a)));
    this.route.params.forEach(p => this.store.dispatch({ type: '[account] query id', payload: p['id']}));
  }

  onSubmit() {
    let account = this.form.value;
    this.store.dispatch({type: '[account] save', payload: {...account, account: account.start_balance || '0'}});
  }

  cancel() {
      this.location.back();
  }
}
