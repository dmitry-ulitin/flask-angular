import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app.routing.module';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools'
import { reducers } from './app.reducers'
import { AppEffects } from './app.effects'
import { AccountsEffects } from './accounts/accounts.effects'
import { CategoriesEffects } from './categories/categories.effects';
import { TransactionsEffects } from './transactions/transactions.effects'

import { AppComponent } from './app.component';
import { AccountsComponent } from './accounts/accounts.component'
import { AccountEditComponent } from './accounts/account.edit.component'
import { TransactionsComponent } from './transactions/transactions.component'
import { CategoriesComponent } from './categories/categories.component'
import { environment } from '../environments/environment';

// i18n
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
import { TransactionEditorComponent } from './transactions/transaction.editor.component';
registerLocaleData(localeRu, 'ru');

@NgModule({
  declarations: [
    AppComponent,
    AccountsComponent, AccountEditComponent,
    TransactionsComponent,
    CategoriesComponent,
    TransactionEditorComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    StoreModule.forRoot(reducers),
    EffectsModule.forRoot([AccountsEffects, CategoriesEffects, TransactionsEffects, AppEffects]),
    StoreDevtoolsModule.instrument({maxAge: 25, logOnly: environment.production})
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'ru' }],
  bootstrap: [AppComponent]
})
export class AppModule { }
