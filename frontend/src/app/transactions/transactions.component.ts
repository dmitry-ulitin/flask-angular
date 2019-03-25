import { Component, OnInit } from '@angular/core';
import { Observable} from 'rxjs';
import { Store } from '@ngrx/store';
import { State } from '../app.reducers'
import { Transaction } from '../models/transaction';
import { Filter } from '../models/filter';
import { Group } from '../models/group';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styles: []
})
export class TransactionsComponent implements OnInit {
  transactions$: Observable<Transaction[]>;
  selected$: Observable<Transaction>;
  filter$: Observable<Filter>;
  groups$: Observable<Group[]>;
  constructor(private store: Store<State>) {}

  ngOnInit() {
    this.transactions$ = this.store.select('transactions', 'transactions');
    this.selected$ = this.store.select('transactions', 'selected');
    this.filter$ = this.store.select('transactions', 'filter');
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

  isFilterEmpty(filter: Filter): boolean {
    return !filter || ((filter.groups || []).length == 0 && (filter.accounts || []).length == 0);
  }

  filterName(filter: Filter): string {
    if (filter && (filter.groups || []).length) {
      return filter.groups.map(g => g.full_name).join(',');
    }
    else if (filter && (filter.accounts || []).length) {
      return filter.accounts.map(a => a.full_name).join(',');
    }
    return this.isFilterEmpty(filter) ? 'Empty' : 'Filter...';
  }

  clearFilter() {
    this.store.dispatch({type:'[transactions] filter groups', payload: []});    
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

  filterGroup(group: Group) {
    this.store.dispatch({type:'[transactions] filter groups', payload: [group]});    
  }
}
