import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Location } from '@angular/common'
import { filter, debounceTime, switchMap } from 'rxjs/operators'
import { Store } from '@ngrx/store';
import { State } from '../app.reducers'
import { Observable, of } from 'rxjs';
import { BackendService } from '../backend.service';
import { User } from '../models/user';

@Component({
  selector: 'app-group-edit',
  templateUrl: './group.edit.component.html',
  styles: []
})
export class GroupEditComponent implements OnInit {
  form: FormGroup;
  accounts: FormArray;
  permissions: FormArray;
  users$: Observable<User[]>
  user: User = null;
  constructor(private store: Store<State>, private route: ActivatedRoute, private location: Location, private fb: FormBuilder, private backend: BackendService) { }

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
      rights: ['Read'],
      username: ['']
    });
    this.addAccount();
    this.store.select('groups', 'sgrp').pipe(filter(g => g != null)).forEach(g => {
      this.form.patchValue(g);
      this.accounts = this.fb.array([]);
      this.form.setControl('accounts', this.accounts);
      g.accounts.forEach(a => this.accounts.push(this.fb.group({ id: a.id, start_balance: a.start_balance, currency: [{ value: a.currency, disabled: a.start_balance != a.balance }], name: a.name, deleted: a.deleted })));
      this.permissions = this.fb.array([]);
      this.form.setControl('permissions', this.permissions);
      g.permissions.forEach(p => this.permissions.push(this.fb.group({ id: p.user.id, email: p.user.email, admin: p.admin, write: [{ value: p.write, disabled: p.admin }], read: [{ value: true, disabled: true }] })));
    });
    this.route.params.forEach(p => this.store.dispatch({ type: '[group] query id', payload: p['id'] }));
    this.users$ = this.form.controls.username.valueChanges.pipe(
      debounceTime(500),
      switchMap(v => {
        if (this.user && this.user.email.toUpperCase() != v.toUpperCase()) {
          this.user = null;
        }
        return v.length > 2 ? this.backend.getUserNames(v, 5) : of([])
      })
    );
  }

  setUserName(user: User) {
    this.user = user;
    this.form.controls.username.setValue(user.email);
  }

  addPermission() {
    if (this.user) {
      let permissions = this.form.get('permissions') as FormArray;
      let rights = this.form.controls.rights.value;
      let admin = rights == 'Admin';
      let write = rights == 'Write';
      permissions.push(this.fb.group({ id: this.user.id, email: this.user.email, admin: admin, write: [{ value: admin || write, disabled: admin }], read: [{ value: true, disabled: true }] }));
      this.user = null;
      this.form.controls.rights.setValue('Read');
      this.form.controls.username.setValue('');
    }
  }

  onSubmit({ value, valid }) {
    this.store.dispatch({ type: '[group] save', payload: value });
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
    accounts.push(this.fb.group({ id: null, start_balance: '', currency: '', deleted: false, name: null }));
  }

  cancel() {
    this.location.back();
  }
}
