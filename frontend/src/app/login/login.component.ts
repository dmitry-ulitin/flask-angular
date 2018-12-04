import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { State } from '../app.reducers'
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  returnUrl: string;
  constructor(private store: Store<State>, private fb: FormBuilder, private route: ActivatedRoute) { }

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit() {
    if(this.form.valid) {
      this.store.dispatch({ type: '[app] login', payload: {email: this.form.controls.email.value, password: this.form.controls.password.value, returnUrl: this.returnUrl} });
    }
  }
}
