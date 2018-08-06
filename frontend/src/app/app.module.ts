import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app.routing.module';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { reducers } from './app.reducers'
import { AppEffects } from './app.effects'
import { AccountsEffects } from './accounts/accounts.effects'

import { AppComponent } from './app.component';
import { BackendService } from './backend.service';
import { AlertifyService } from './alertify.service'
import { AccountsComponent } from './accounts/accounts.component'
import { AccountEditComponent } from './accounts/account.edit.component'

@NgModule({
  declarations: [
    AppComponent,
    AccountsComponent, AccountEditComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    StoreModule.forRoot(reducers),
    EffectsModule.forRoot([AccountsEffects, AppEffects])
  ],
  providers: [BackendService, AlertifyService],
  bootstrap: [AppComponent]
})
export class AppModule { }
