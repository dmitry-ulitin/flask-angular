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

import { AppComponent } from './app.component';
import { AccountsComponent } from './accounts/accounts.component'
import { AccountEditComponent } from './accounts/account.edit.component'
import { CategoriesComponent } from './categories/categories.component'
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    AccountsComponent, AccountEditComponent,
    CategoriesComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    StoreModule.forRoot(reducers),
    EffectsModule.forRoot([AccountsEffects, CategoriesEffects, AppEffects]),
    StoreDevtoolsModule.instrument({maxAge: 25, logOnly: environment.production})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
