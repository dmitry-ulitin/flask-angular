import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountsComponent } from './accounts/accounts.component'

const routes: Routes = [
  {
    path: "accounts",
    component: AccountsComponent
  },
  {
    path: '',
    redirectTo: '/accounts',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
