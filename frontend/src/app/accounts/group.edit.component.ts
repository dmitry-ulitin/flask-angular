import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Location } from '@angular/common'
import { tap, filter } from 'rxjs/operators'
import { Store } from '@ngrx/store';
import { State } from '../app.reducers'

@Component({
  selector: 'app-group-edit',
  templateUrl: './group.edit.component.html',
  styles: []
})
export class GroupEditComponent implements OnInit {
  form: FormGroup;
  accounts: FormArray;
  permissions: FormArray;
  constructor(private store: Store<State>, private route: ActivatedRoute, private location: Location, private fb: FormBuilder) {}

  ngOnInit() {
    this.accounts = this.fb.array([]);
    this.permissions = this.fb.array([]);
    this.form = this.fb.group({
      id: [],
      name: ['', Validators.required],
      hidden: [false],
      inbalance: [true],
      accounts: this.accounts,
      permissions: this.permissions,
      username:['']
    });
    this.addAccount();
    this.store.select('groups', 'sgrp').pipe(filter(g => g != null)).forEach(g => {
      this.form.patchValue(g);
      this.accounts = this.fb.array([]);
      this.form.setControl('accounts', this.accounts);
      g.accounts.forEach(a => this.accounts.push(this.fb.group({id: a.id, start_balance: a.start_balance, currency: [{value:a.currency, disabled: a.start_balance != a.balance}], name: a.name, deleted: a.deleted})));
      this.permissions = this.fb.array([]);
      this.form.setControl('permissions', this.permissions);
      g.permissions.forEach(p => this.permissions.push(this.fb.group({id: p.user.id, email: p.user.email, admin: p.admin, write: [{value:p.write, disabled: p.admin}], read: [{value: true, disabled: true}]})));
    });
    this.route.params.forEach(p => this.store.dispatch({ type: '[group] query id', payload: p['id']}));
  }

  onSubmit({ value, valid }) {
    this.store.dispatch({type: '[group] save', payload: value});
  }

  canDelete(): boolean {
    return this.accounts.controls.filter(a => !a.get('deleted').value).length > 1;
  }

  delete(item) {
    item.get('deleted').setValue(true);
  }

  check(item) {
    if (item.get('admin').value) {
      item.get('write').disable();
      item.get('read').disable();
      item.get('write').setValue(true);
    }
    else {
      item.get('write').enable();
    }
  }

  addAccount() {
    let accounts = this.form.get('accounts') as FormArray;
    accounts.push(this.fb.group({id: null, start_balance: '', currency: '', deleted: false, name: null}));
  }

  cancel() {
      this.location.back();
  }
}
