import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { LoginComponent } from './login/login.component';
import { GroupsComponent } from './accounts/groups.component'
//import { GroupEditComponent } from './accounts/account.edit.component'
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
    component: GroupsComponent,
    canActivate: [AuthGuard]
  },
  /*
  {
    path: "accounts/create",
    component: GroupEditComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "accounts/edit/:id",
    component: GroupEditComponent,
    canActivate: [AuthGuard]
  },
  */
  {
    path: "transactions",
    component: TransactionsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "transactions/create",
    component: TransactionEditorComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "transactions/edit/:id",
    component: TransactionEditorComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'categories',
    component: CategoriesComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
