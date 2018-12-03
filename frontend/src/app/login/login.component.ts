import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable} from 'rxjs';
import { Store } from '@ngrx/store';
import { State } from '../app.reducers'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  constructor(private store: Store<State>, private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({
        email: ['', Validators.required],
        password: ['', Validators.required]
      });
    }
}
