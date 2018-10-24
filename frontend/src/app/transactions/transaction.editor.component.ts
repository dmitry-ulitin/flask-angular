import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, combineLatest} from 'rxjs';
import { filter, tap, map } from 'rxjs/operators'
import { Store } from '@ngrx/store';
import { State } from '../app.reducers'
import { Account } from '../models/account';
import { Category } from '../models/category';

@Component({
  selector: 'app-transaction-editor',
  templateUrl: './transaction.editor.component.html',
  styles: []
})
export class TransactionEditorComponent implements OnInit {
  accounts$: Observable<Account[]>;
  categories$: Observable<Category[]>;

  types = ['Expense','Income','Transfer'];
  add_category = false;
  form: FormGroup;
  constructor(private store: Store<State>, private route: ActivatedRoute, private location: Location, private fb: FormBuilder) {}

  ngOnInit() {
    this.route.params.forEach(p => this.store.dispatch({ type: '[transaction] query id', payload: p['id']}));
    this.form = this.fb.group({
      type: [0],
      amount: ['', Validators.required],
      currency: ['', Validators.required],
      account: [],
      recipient: [],
      category: [null],
      cname: [],
      opdate: [new Date().toISOString().substr(0,10), Validators.required],
      details: []
    });
    this.store.select('transactions', 'selected').pipe(filter(t => t != null)).forEach(
      a => this.form.patchValue({...a, type: !a.recipient ? 0 : (a.account ? 2 : 1)})
    );
    this.accounts$ = this.store.select('accounts', 'accounts');
    this.categories$ = this.store.select('categories','expenses').pipe(map(t => tree2flat(t, [{...t, name: '???'}])));

    // if account and recipient are empty then select account
    this.accounts$.forEach(a => {
      if (a.length && !this.form.controls.account.value && !this.form.controls.recipient.value) {
        this.form.controls.account.setValue(a[0]);
      }
    });
    // if account has changed then change currency
    this.form.controls.account.valueChanges.forEach(e => {
      if (e) this.form.controls.currency.setValue(e.currency)
    });
    // if recipient has changed then change currency
    this.form.controls.recipient.valueChanges.forEach(e => {
      if (e) this.form.controls.currency.setValue(e.currency)
    });
    // be sure that account and recipient are different
    combineLatest(this.accounts$, this.form.controls.account.valueChanges).forEach(([a,v]) => {
      if (this.form.controls.recipient.value == v) {
        this.form.controls.recipient.setValue(a.filter(item => item != v)[0]);
      }
    });
    combineLatest(this.accounts$, this.form.controls.recipient.valueChanges).forEach(([a,v]) => {
      if (this.form.controls.account.value == v) {
        this.form.controls.account.setValue(a.filter(item => item != v)[0]);
      }
    });
  }

  setType(type: number) {
    let acc = this.form.controls.account.value;
    let rec = this.form.controls.recipient.value;
    if (type == 0) {
      this.form.controls.account.setValue(acc || rec);
      this.form.controls.recipient.setValue(null);
    }
    else if (type == 1) {
      this.form.controls.account.setValue(null);
      this.form.controls.recipient.setValue(rec || acc);
    }
    else if (type == 2) {
      this.form.controls.account.setValue(acc || rec);
      this.form.controls.recipient.setValue(rec || acc);
    }
    this.form.controls.type.setValue(type);
  }

  setCategory(c: Category) {
    this.form.controls.category.setValue(c);
  }

  onSubmit({ value, valid }) {
    if (this.add_category && value.category) {
      this.store.dispatch({ type: '[category] save', payload: { name: value.cname, parent_id: value.category.id}});
    }
  }

  cancel() {
      this.location.back();
  }
}

function tree2flat(tree: Category, flat: Category[]): Category[] {
  if (tree && tree.children) {
      for (let c of tree.children) {
          flat.push(c);
          tree2flat(c, flat);
      }
  }
  return flat;
}
