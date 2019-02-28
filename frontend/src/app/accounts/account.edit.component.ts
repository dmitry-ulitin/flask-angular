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
  templateUrl: './account.edit.component.html',
  styles: []
})
export class AccountEditComponent implements OnInit {
  form: FormGroup;
  constructor(private store: Store<State>, private route: ActivatedRoute, private location: Location, private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({
      id: [],
      name: ['', Validators.required],
      currency: [''],
      start_balance: [],
      hidden: [false],
      inbalance: [true],
    });
    this.store.select('accounts', 'selected').pipe(filter(a => a != null)).forEach(a => this.form.patchValue({...a, hidden: !a.visible}));
    this.route.params.forEach(p => this.store.dispatch({ type: '[account] query id', payload: p['id']}));
  }

  onSubmit({ value, valid }) {
    this.store.dispatch({type: '[account] save', payload: {...value, start_balance: value.start_balance || '0', currency: value.currency || 'RUB', visible: !value.hidden}});
  }

  cancel() {
      this.location.back();
  }
}
