import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Location } from '@angular/common'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Account } from '../models/account';
import { Category } from '../models/category';
//import { Transaction } from '../models/transaction';

@Component({
    selector: 'app-transaction-form',
    templateUrl: './transaction.form.component.html',
    styles: []
})
export class TransactionFormComponent implements OnInit, OnChanges {
    @Input('data') data: any;
    @Input('accounts') accounts: Account[];
    @Input('expenses') expenses: Category[];
    @Input('income') income: Category[];
    @Output('save')
    save = new EventEmitter<any>();

    types = ['Transfer', 'Expense', 'Income'];
    categories:Category[] = [];
    add_category = false;
    form: FormGroup;
    constructor(private location: Location, private fb: FormBuilder) {
        this.form = this.fb.group({
            id: [],
            ttype: [0],
            tamount: ['', Validators.required],
            tcurrency: ['', Validators.required],
            camount: [''],
            ccurrency: [''],
            account: [],
            recipient: [],
            category: [],
            cname: [],
            opdate: [new Date().toISOString().substr(0, 10), Validators.required],
            details: []
        });
    }
    ngOnInit() {
        this.setType(0);
    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log(changes);
        if (changes.data && changes.data.currentValue && changes.data.currentValue.id) {
            this.form.patchValue(changes.data.currentValue);
            this.form.controls.tamount.setValue(changes.data.currentValue.credit);
            this.form.controls.tcurrency.setValue(changes.data.currentValue.currency);
            this.form.controls.opdate.setValue(changes.data.currentValue.opdate.substr(0,10));
            this.setCategory(changes.data.currentValue.category);
            this.setAccount(changes.data.currentValue.account);
            this.setRecipient(changes.data.currentValue.recipient);
            this.setType(changes.data.currentValue.ttype);
        }
    }

    setType(ttype: number) {
        let change = this.form.controls.ttype.value != ttype;
        this.form.controls.ttype.setValue(ttype);
        let acc = this.form.controls.account.value;
        let rec = this.form.controls.recipient.value;
        if (ttype == 0) {
            this.setAccount(acc || rec || this.accounts[0]);
            this.setRecipient(rec || acc || this.accounts[1]);
            this.categories = [];
        }
        else if (ttype == 1) {
            this.setAccount(acc || rec || this.accounts[0]);
            this.setRecipient(null);
            this.categories = this.expenses || [];
        }
        else if (ttype == 2) {
            this.setAccount(null);
            this.setRecipient(rec || acc || this.accounts[0]);
            this.categories = this.income || [];
        }
        if (change) {
            this.setCategory(this.categories.length ? this.categories[0] : null);
        }
    }

    setAccount(a: Account) {
        this.form.controls.account.setValue(a);
        if (a) {
            if (this.form.controls.ttype.value > 0 || !this.form.controls.id.value) {
                this.form.controls.tcurrency.setValue(a.currency)
            }
            if (this.form.controls.recipient.value == a) {
                this.form.controls.recipient.setValue(this.accounts.filter(item => item != a)[0]);
            }
        }
    }

    setRecipient(a: Account) {
        this.form.controls.recipient.setValue(a);
        if (a) {
            if (this.form.controls.ttype.value > 0 || !this.form.controls.id.value) {
                this.form.controls.tcurrency.setValue(a.currency)
            }
            this.form.controls.ccurrency.setValue(a.currency)
            if (this.form.controls.account.value == a) {
                this.form.controls.account.setValue(this.accounts.filter(item => item != a)[0]);
            }
        }
    }

    setCategory(c: Category) {
        this.form.controls.category.setValue(c);
    }

    isConverted() {
        return false;
    }

    prev() {
        var today = new Date(this.form.controls.opdate.value);
        today.setDate(today.getDate() - 1);
        this.form.controls.opdate.setValue(today.toISOString().substr(0,10))
    }

    today() {
        var today = new Date();
        this.form.controls.opdate.setValue(today.toISOString().substr(0,10))
    }

    next() {
        var today = new Date(this.form.controls.opdate.value);
        today.setDate(today.getDate() + 1);
        this.form.controls.opdate.setValue(today.toISOString().substr(0,10))
    }


    onSubmit({ value, valid }) {
        value.credit = value.debit = value.tamount;
        value.currency = value.tcurrency;
        this.save.emit(value);
    }

    cancel() {
        this.location.back();
    }
}
