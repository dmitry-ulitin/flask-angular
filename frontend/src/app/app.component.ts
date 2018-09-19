import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
<div class="d-flex flex-column h-100">
  <nav class="navbar navbar-light bg-light navbar-expand-sm">
    <div class="container">
      <span class="navbar-brand mb-0 h1">Swarmer</span>
      <div class="navbar-nav">
        <a class="nav-item nav-link" href="#" routerLink="/accounts" routerLinkActive="active">Accounts</a>
        <a class="nav-item nav-link" href="#" routerLink="/transactions" routerLinkActive="active">Transactions</a>
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
