import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app.routing.module';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools'
import { reducers } from './app.reducers'
import { AppEffects } from './app.effects'
import { GroupsEffects } from './accounts/groups.effects'
import { CategoriesEffects } from './categories/categories.effects';
import { TransactionsEffects } from './transactions/transactions.effects'

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component'
import { GroupsComponent } from './accounts/groups.component'
import { TransactionsComponent } from './transactions/transactions.component'
import { TransactionEditorComponent } from './transactions/transaction.editor.component';
import { TransactionFormComponent } from './transactions/transaction.form.component';
import { CategoriesComponent } from './categories/categories.component'
import { environment } from '../environments/environment';
import { ServiceWorkerModule } from '@angular/service-worker';
import { JwtInterceptor } from './jwt.interceptor';
import { ErrorInterceptor } from './error.interceptor';

// i18n
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
registerLocaleData(localeRu, 'ru');

@NgModule({
  declarations: [
    AppComponent,LoginComponent,
    GroupsComponent,
    TransactionsComponent,TransactionFormComponent,TransactionEditorComponent,
    CategoriesComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    StoreModule.forRoot(reducers),
    EffectsModule.forRoot([GroupsEffects, CategoriesEffects, TransactionsEffects, AppEffects]),
    StoreDevtoolsModule.instrument({maxAge: 25, logOnly: environment.production}),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: LOCALE_ID, useValue: 'ru' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
