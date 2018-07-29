import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app.routing.module';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { reducers } from './app.reducers'
import { AccountsEffects } from './accounts/accounts.effects'

import { AppComponent } from './app.component';
import { BackendService } from './backend.service';
import { AccountsComponent } from './accounts/accounts.component'

@NgModule({
  declarations: [
    AppComponent,
    AccountsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    StoreModule.forRoot(reducers),
    EffectsModule.forRoot([AccountsEffects])
  ],
  providers: [BackendService],
  bootstrap: [AppComponent]
})
export class AppModule { }
