import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Location } from '@angular/common'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Account } from '../models/account';
import { Category } from '../models/category';
import { map } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';

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
    @Output('save') save = new EventEmitter<any>();

    types = ['Transfer', 'Expense', 'Income'];
    categories:Category[] = [];
    add_category = false;
    convert$: Observable<boolean>;
    form: FormGroup;
    aconvert = false;
    rconvert = false;
    constructor(private location: Location, private fb: FormBuilder) {
        this.form = this.fb.group({
            id: [],
            ttype: [1],
            amount: ['', Validators.required],
            currency: ['', Validators.required],
            credit: [''],
            acurrency: [{ value: '', disabled: true }],
            debit: [''],
            rcurrency: [{ value: '', disabled: true }],
            account: [],
            recipient: [],
            category: [],
            cname: [],
            opdate: [new Date().toISOString().substr(0, 10), Validators.required],
            details: []
        });
        this.today();
    }
    
    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log(changes);
        if (changes.data && changes.data.currentValue) {
            this.setRecipient(changes.data.currentValue.recipient);
            this.setAccount(changes.data.currentValue.account);
            this.setType(changes.data.currentValue.ttype);
            if (changes.data.currentValue.id) {
                this.form.patchValue(changes.data.currentValue);
                this.form.controls.amount.setValue(changes.data.currentValue.ttype == 1 ? changes.data.currentValue.debit : changes.data.currentValue.credit);
                this.form.controls.currency.setValue(changes.data.currentValue.currency);
                this.form.controls.credit.setValue(changes.data.currentValue.credit);
                this.form.controls.debit.setValue(changes.data.currentValue.debit);
                this.form.controls.opdate.setValue(changes.data.currentValue.opdate.substr(0,10));
                this.setCategory(changes.data.currentValue.category);
            }
        }
        this.setType(this.form.controls.ttype.value);
        this.convert$ = combineLatest(this.form.controls.currency.valueChanges,this.form.controls.acurrency.valueChanges,this.form.controls.rcurrency.valueChanges).pipe(
            map(([c,ac,rc]) => ac && ac!=c || rc && rc!=c));
    }

    setType(ttype: number) {
        let change = this.form.controls.ttype.value != ttype;
        this.form.controls.ttype.setValue(ttype);
        let acc = this.form.controls.account.value;
        let rec = this.form.controls.recipient.value;
        if (ttype == 0) {
            this.setRecipient(acc || rec || this.accounts[1]);
            this.setAccount(acc || rec || this.accounts[0]);
            this.categories = [];
            this.form.controls.amount.setValue(this.form.controls.credit.value);
            this.form.controls.currency.disable();
        }
        else if (ttype == 1) {
            this.setAccount(acc || rec || this.accounts[0]);
            this.setRecipient(null);
            this.categories = this.expenses || [];
            this.form.controls.amount.setValue(this.form.controls.debit.value);
            this.form.controls.currency.enable();
        }
        else if (ttype == 2) {
            this.setAccount(null);
            this.setRecipient(rec || acc || this.accounts[0]);
            this.categories = this.income || [];
            this.form.controls.amount.setValue(this.form.controls.credit.value);
            this.form.controls.currency.enable();
        }
        if (change || !this.form.controls.category.value || !this.form.controls.category.value.id) {
            this.setCategory(null);
        }
    }

    setAccount(a: Account) {
        if (a && this.form.controls.recipient.value == a) {
            let r = this.form.controls.account.value || this.accounts.filter(acc => acc != a)[0];
            this.form.controls.recipient.setValue(r);
            this.form.controls.rcurrency.setValue(r ? r.currency : null);
        }
        this.form.controls.account.setValue(a);
        this.form.controls.acurrency.setValue(a ? a.currency : null);
        if (a && !this.form.controls.id.value) {
            this.form.controls.currency.setValue(this.form.controls.acurrency.value);
        }
        this.aconvert = a && this.form.controls.currency.value != this.form.controls.acurrency.value;
        this.rconvert = !this.aconvert && this.form.controls.recipient.value && this.form.controls.currency.value != this.form.controls.rcurrency.value;
    }

    setRecipient(r: Account) {
        if (r && this.form.controls.account.value == r) {
            let a = this.form.controls.recipient.value || this.accounts.filter(acc => acc != r)[0];
            this.form.controls.account.setValue(a);
            this.form.controls.acurrency.setValue(a ? a.currency : null);
        }
        this.form.controls.recipient.setValue(r);
        this.form.controls.rcurrency.setValue(r ? r.currency : null);
        if (this.form.controls.ttype.value != 0 && r && !this.form.controls.id.value) {
            this.form.controls.currency.setValue(this.form.controls.rcurrency.value);
        }
        this.rconvert = r && this.form.controls.currency.value != this.form.controls.rcurrency.value;
        this.aconvert = !this.rconvert && this.form.controls.account.value && this.form.controls.currency.value != this.form.controls.acurrency.value;
    }

    setCategory(c: Category) {
        this.form.controls.category.setValue(c);
    }

    prev() {
        var today = new Date(this.form.controls.opdate.value);
        today.setDate(today.getDate() - 1);
        let tzoffset = today.getTimezoneOffset() * 60000;
        let localISOTime = (new Date(today.getTime() - tzoffset)).toISOString().slice(0, -1);
        this.form.controls.opdate.setValue(localISOTime.substr(0,10))
    }

    today() {
        var today = new Date();
        let tzoffset = today.getTimezoneOffset() * 60000;
        let localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
        this.form.controls.opdate.setValue(localISOTime.substr(0,10))
    }

    next() {
        var today = new Date(this.form.controls.opdate.value);
        today.setDate(today.getDate() + 1);
        let tzoffset = today.getTimezoneOffset() * 60000;
        let localISOTime = (new Date(today.getTime() - tzoffset)).toISOString().slice(0, -1);
        this.form.controls.opdate.setValue(localISOTime.substr(0,10))
    }


    onSubmit({ value, valid }) {
        value.credit = value.debit = value.amount;
        value.cname = this.add_category && value.ttype ? value.cname : null;
        let tzoffset = (new Date()).getTimezoneOffset() * 60000;
        let localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
        value.opdate += localISOTime.substr(10)
        this.save.emit(value);
    }

    onCancel() {
        this.location.back();
    }
}
