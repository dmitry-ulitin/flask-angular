import { Component, OnInit } from '@angular/core';
import { Observable} from 'rxjs';
import { Store } from '@ngrx/store';
import { State } from '../app.reducers'
import { Group } from '../models/group';
import { map } from 'rxjs/operators';
import { Balance, Amount, Total } from '../models/balance';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styles: []
})
export class GroupsComponent implements OnInit {
  groups$: Observable<Group[]>;
  total$: Observable<Amount[]>;
  sgrp$: Observable<Group>;
  extended$: Observable<boolean>;
  constructor(private store: Store<State>) {}

  ngOnInit() {
    this.groups$ = this.store.select('groups', 'groups').pipe(map(groups => groups.filter(g => !g.deleted)));
    this.total$ = this.store.select('groups', 'total').pipe(map(t => Object.values(t)));
    this.sgrp$ = this.store.select('groups', 'sgrp');
    this.extended$ = this.store.select('groups', 'extended');
  }

  refresh() {
    this.store.dispatch({type:'[groups] query'});
  }

  select(g: Group) {
    this.store.dispatch({type:'[groups] select', payload: g});
  }

  watched(g: Group) {
    return g.belong == 1 && g.permissions.length>0;
  }

  create() {
    this.store.dispatch({type:'[groups] create'});    
  }

  delete() {
    this.store.dispatch({type:'[groups] delete'});    
  }

  filterGroup(group: Group) {
    this.store.dispatch({type:'[transactions] filter groups', payload: [group]});    
  }

  filterAccount(account: Account) {
    this.store.dispatch({type:'[transactions] filter accounts', payload: [account]});    
  }

  createTr(ttype: number) {
    this.store.dispatch({type:'[transactions] create', payload: {ttype:ttype}});
  }

  getTotal(group: Group) {
    return Object.values(Total.total(group));
  }
}
