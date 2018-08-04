import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common'
import { Observable} from 'rxjs';
import { tap } from 'rxjs/operators'
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
  constructor(private store: Store<State>, private location: Location, private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      currency: ['', Validators.required],
      start_balance: [],
      balance: [],
      hidden: [false]
    });
    this.account$ = this.store.select('accounts', 'selected').pipe(tap(a => this.form.patchValue(a)));
  }

  onSubmit() {
    this.store.dispatch({type: '[account] save', payload: this.form.value});
  }

  cancel() {
      this.location.back();
  }
}
