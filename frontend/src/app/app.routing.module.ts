import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountsComponent } from './accounts/accounts.component'
import { AccountEditComponent } from './accounts/account.edit.component'

const routes: Routes = [
  {
    path: '',
    redirectTo: '/accounts',
    pathMatch: 'full'
  },
  {
    path: "accounts",
    component: AccountsComponent
  },
  {
    path: "accounts/create",
    component: AccountEditComponent
  },
  {
    path: "accounts/edit/:id",
    component: AccountEditComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
