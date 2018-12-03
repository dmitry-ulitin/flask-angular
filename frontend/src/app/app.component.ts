import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
  <nav class="navbar navbar-light bg-light fixed-top">
    <div class="container">
      <span class="navbar-brand mb-0 h1">Swarmer</span>
      <div class="d-flex flex-row">
        <a class="nav-item nav-link" href="#" routerLink="/accounts" routerLinkActive="active"><i class="fas fa-database"></i><span class="d-none d-sm-inline"> Accounts</span></a>
        <a class="nav-item nav-link" href="#" routerLink="/transactions" routerLinkActive="active"><i class="fas fa-list-ul"></i><span class="d-none d-sm-inline"> Transactions</span></a>
      </div>
    </div>
  </nav>
  <div class="container h-100">
    <router-outlet></router-outlet>
  </div>
`,
  styles: []
})
export class AppComponent {
  title = 'app';
}
