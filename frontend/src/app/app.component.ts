import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
<div class="d-flex flex-column h-100">
    <nav class="navbar navbar-light bg-light">
      <span class="navbar-brand mb-0 h1">Swarmer</span>
    </nav>
    <div class="d-flex flex-column flex-grow-1">
        <div id="two" class="bg-info h-100 flex-grow-1">
          <router-outlet></router-outlet>
        </div>
        <div><!--footer content--></div>
    </div>
</div>
`,
  styles: []
})
export class AppComponent {
  title = 'app';
}
