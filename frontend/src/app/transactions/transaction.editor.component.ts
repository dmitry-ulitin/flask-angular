import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable} from 'rxjs';
import { filter, tap } from 'rxjs/operators'
import { Store } from '@ngrx/store';
import { State } from '../app.reducers'
import { Account } from '../models/account';

@Component({
  selector: 'app-transaction-editor',
  templateUrl: './transaction.editor.component.html',
  styles: []
})
export class TransactionEditorComponent implements OnInit {
  accounts$: Observable<Account[]>;
  form: FormGroup;
  constructor(private store: Store<State>, private route: ActivatedRoute, private location: Location, private fb: FormBuilder) {}

  ngOnInit() {
    this.route.params.forEach(p => this.store.dispatch({ type: '[transaction] query id', payload: p['id']}));
    this.form = this.fb.group({
      amount: ['', Validators.required],
      currency: ['', Validators.required],
      account: ['', Validators.required],
      opdate: [new Date().toISOString().substr(0,10), Validators.required],
      details: []
    });
    this.store.select('transactions', 'selected').pipe(filter(t => t != null)).forEach(a => this.form.patchValue(a));
    this.accounts$ = this.store.select('accounts', 'accounts').pipe(tap(a => {
      if (a.length && !this.form.controls.account.value) {
        this.form.controls.account.setValue(a[0]);
      }
    }));
    this.form.controls.account.valueChanges.forEach(e => {
      this.form.controls.currency.setValue(e.currency)
    });
  }

  onSubmit({ value, valid }) {
  }

  cancel() {
      this.location.back();
  }
}
