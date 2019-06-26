import { Component, OnInit } from '@angular/core';
import { Observable} from 'rxjs';
import { Store } from '@ngrx/store';
import { State } from '../app.reducers'
import { Transaction } from '../models/transaction';
import { Filter, Filters } from '../models/filter';
import { Group } from '../models/group';
import { map } from 'rxjs/operators';
import { Amount } from '../models/balance';
import { Category } from '../models/category';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styles: []
})
export class TransactionsComponent implements OnInit {
  transactions$: Observable<Transaction[]>;
  selected$: Observable<Transaction>;
  filters$: Observable<Filters>;
  groups$: Observable<Group[]>;
  constructor(private store: Store<State>) {}

  ngOnInit() {
    this.transactions$ = this.store.select('transactions', 'transactions');
    this.selected$ = this.store.select('transactions', 'selected');
    this.filters$ = this.store.select('transactions', 'filters');
    this.groups$ = this.store.select('groups', 'groups').pipe(map(groups => groups.filter(g => !g.deleted)));
  }

  refresh() {
    this.store.dispatch({type:'[transactions] query'});
  }

  select(a: Transaction) {
    this.store.dispatch({type:'[transactions] select', payload: a});    
  }

  create(ttype: number) {
    this.store.dispatch({type:'[transactions] create', payload: {ttype:ttype}});
  }

  delete() {
    this.store.dispatch({type:'[transactions] delete'});    
  }

  clearFilter(filter: Filter) {
    this.store.dispatch({type:'[transactions] clear filter', payload: filter});    
  }

  getName(t: Transaction) {
    if (t.account && t.recipient) {
      return t.account.full_name + ' => ' + t.recipient.full_name;
    }
    return t.category ? t.category.name : '-';
  }

  getBalance(t: Transaction) {
    return t.account && t.account.balance ? t.account : (t.recipient && t.recipient.balance ? t.recipient : null);
  }

  getAmount(t: Transaction) : Amount {
    return t.account ? {value: t.credit, currency: t.account.currency} : (t.recipient ? {value: t.debit, currency: t.recipient.currency} : {value: t.credit, currency: t.currency});
  }

  filterGroup(group: Group) {
    this.store.dispatch({type:'[transactions] add filter', payload: <Filter>{name: group.full_name, accounts: group.accounts}});    
  }

  filterAllAccounts() {
    this.store.dispatch({type:'[transactions] add filter', payload: <Filter>{name: 'All Accounts', scope: 3}});    
  }

  filterCategory(c: Category) {
    this.store.dispatch({type:'[transactions] add filter', payload: <Filter>{name: c.name, categories:[c]}});    
  }

  filterSelectedCategory() {
    this.store.dispatch({type:'[transactions] add filter selected category'});    
  }
}
