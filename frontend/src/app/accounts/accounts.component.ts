import { Component, OnInit } from '@angular/core';
import { BackendService } from '../backend.service';
import { Account } from '../models/account';

@Component({
  selector: 'app-accounts',
  template: `
    <table>
    <tr *ngFor="let a of accounts">
      <td>{{a.name}}</td>
      <td>{{a.balance}} {{a.currency}}</td>
    </tr>
    </table>
  `,
  styles: []
})
export class AccountsComponent implements OnInit {
  accounts: Account[];
  constructor(private backend: BackendService) { }

  ngOnInit() {
    this.backend.getAccounts().then(accounts => this.accounts = accounts);
  }
}
