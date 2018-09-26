import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
<div class="d-flex flex-column h-100">
  <nav class="navbar navbar-light bg-light">
    <div class="container">
      <span class="navbar-brand mb-0 h1">Swarmer</span>
      <div class="d-flex flex-row">
        <a class="nav-item nav-link" href="#" routerLink="/accounts" routerLinkActive="active"><i class="fas fa-database"></i><span class="d-none d-sm-inline"> Accounts</span></a>
        <a class="nav-item nav-link" href="#" routerLink="/transactions" routerLinkActive="active"><i class="fas fa-list-ul"></i><span class="d-none d-sm-inline"> Transactions</span></a>
      </div>
    </div>
  </nav>
  <div class="flex-grow-1">
    <div class="container mt-2">
      <router-outlet></router-outlet>
    </div>
  </div>
</div>
`,
  styles: []
})
export class AppComponent {
  title = 'app';
}
