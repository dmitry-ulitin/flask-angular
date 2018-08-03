import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
<div class="d-flex flex-column h-100">
    <nav class="navbar navbar-light bg-light">
      <div class="container">
        <span class="navbar-brand mb-0 h1">Swarmer</span>
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
