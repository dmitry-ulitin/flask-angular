import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AccountsComponent } from './accounts/accounts.component'
import { AccountEditComponent } from './accounts/account.edit.component'
import { TransactionsComponent } from './transactions/transactions.component'
import { TransactionEditorComponent } from './transactions/transaction.editor.component';
import { CategoriesComponent } from './categories/categories.component'

const routes: Routes = [
  {
    path: '',
    redirectTo: '/accounts',
    pathMatch: 'full'
  },
  {
    path: "login",
    component: LoginComponent
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
  },
  {
    path: "transactions",
    component: TransactionsComponent
  },
  {
    path: "transactions/create",
    component: TransactionEditorComponent
  },
  {
    path: "transactions/edit/:id",
    component: TransactionEditorComponent
  },
  {
    path: 'categories',
    component: CategoriesComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
