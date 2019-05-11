import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Location } from '@angular/common'
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Account } from '../models/account';
import { Category } from '../models/category';
import { BackendService } from '../backend.service';
import { AuthService } from '../auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-transaction-form',
    templateUrl: './transaction.form.component.html',
    styles: []
})
export class TransactionFormComponent implements OnInit, OnDestroy, OnChanges {
    @Input('data') data: any;
    @Input('accounts') accounts: Account[];
    @Input('expenses') expenses: Category[];
    @Input('income') income: Category[];
    @Output('save') save = new EventEmitter<any>();

    destroy$: Subject<boolean> = new Subject<boolean>();
    types = ['Transfer', 'Expense', 'Income'];
    categories: Category[] = [];
    add_category = false;
    form: FormGroup;
    aconvert = true;
    rconvert = true;
    constructor(private location: Location, private fb: FormBuilder, private backend: BackendService, private auth: AuthService) {
        this.form = this.fb.group({
            id: [],
            ttype: [1],
            account: [],
            credit: [''],
            acurrency: [{ value: '', disabled: true }],
            recipient: [],
            debit: [''],
            rcurrency: [{ value: '', disabled: true }],
            category: [],
            cname: [],
            opdate: [new Date().toISOString().substr(0, 10), Validators.required],
            details: []
        });
        this.today();
        this.form.controls.credit.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(c => {
            this.convert();
        });
        this.form.controls.debit.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(c => {
            this.convert();
        });
        this.form.controls.acurrency.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(c => {
            this.rconvert = this.form.controls.ttype.value == 1 || this.form.controls.recipient.value && this.form.controls.rcurrency.value != this.form.controls.acurrency.value;
            this.convert();
        });
        this.form.controls.rcurrency.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(c => {
            this.aconvert = this.form.controls.ttype.value != 1 || this.form.controls.account.value && this.form.controls.rcurrency.value != this.form.controls.acurrency.value;
            this.convert();
        });
    }

    ngOnInit() {
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log(changes);
        if (changes.data && changes.data.currentValue) {
            this.setRecipient(changes.data.currentValue.recipient);
            this.setAccount(changes.data.currentValue.account);
            this.setType(changes.data.currentValue.ttype);
            if (changes.data.currentValue.id) {
                this.form.patchValue(changes.data.currentValue);
                this.form.controls.credit.setValue(changes.data.currentValue.credit);
                this.form.controls.acurrency.setValue(changes.data.currentValue.account ? changes.data.currentValue.account.currency : changes.data.currentValue.currency);
                this.form.controls.debit.setValue(changes.data.currentValue.debit);
                this.form.controls.rcurrency.setValue(changes.data.currentValue.recipient ? changes.data.currentValue.recipient.currency : changes.data.currentValue.currency);
                this.form.controls.opdate.setValue(changes.data.currentValue.opdate.substr(0, 10));
                this.setCategory(changes.data.currentValue.category);
            }
        }
        this.setType(this.form.controls.ttype.value);
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
            this.form.controls.acurrency.disable();
            this.form.controls.rcurrency.disable();
        }
        else if (ttype == 1) {
            this.setAccount(acc || rec || this.accounts[0]);
            this.setRecipient(null);
            this.categories = this.expenses || [];
            this.form.controls.rcurrency.enable();
            this.form.controls.acurrency.disable();
        }
        else if (ttype == 2) {
            this.setAccount(null);
            this.setRecipient(rec || acc || this.accounts[0]);
            this.categories = this.income || [];
            this.form.controls.acurrency.enable();
            this.form.controls.rcurrency.disable();
        }
        if (change || !this.form.controls.category.value || !this.form.controls.category.value.id) {
            this.setCategory(null);
        }
    }

    setAccount(a: Account, dirty: boolean = false) {
        if (a && this.form.controls.recipient.value == a) {
            let r = this.form.controls.account.value || this.accounts.filter(acc => acc != a)[0];
            this.form.controls.recipient.setValue(r);
            this.form.controls.rcurrency.setValue(r ? r.currency : null);
        }
        this.form.controls.account.setValue(a);
        if (dirty) {
            this.form.controls.account.markAsDirty();
        }
        if (a) {
            this.form.controls.acurrency.setValue(a.currency);
        }
        this.setCurrency();
    }

    setRecipient(r: Account, dirty: boolean = false) {
        if (r && this.form.controls.account.value == r) {
            let a = this.form.controls.recipient.value || this.accounts.filter(acc => acc != r)[0];
            this.form.controls.account.setValue(a);
            this.form.controls.acurrency.setValue(a ? a.currency : null);
        }
        this.form.controls.recipient.setValue(r);
        if (dirty) {
            this.form.controls.recipient.markAsDirty();
        }
        if (r) {
            this.form.controls.rcurrency.setValue(r.currency);
        }
        this.setCurrency();
    }

    setCurrency() {
        if (this.form.controls.account.value && !this.form.controls.id.value && !this.form.controls.recipient.value) {
            this.form.controls.rcurrency.setValue(this.form.controls.acurrency.value);
        }
        if (this.form.controls.recipient.value && !this.form.controls.id.value && !this.form.controls.account.value) {
            this.form.controls.acurrency.setValue(this.form.controls.rcurrency.value);
        }
        this.aconvert = this.form.controls.ttype.value != 1 || this.form.controls.account.value && this.form.controls.rcurrency.value != this.form.controls.acurrency.value;
        this.rconvert = this.form.controls.ttype.value == 1 || this.form.controls.recipient.value && this.form.controls.rcurrency.value != this.form.controls.acurrency.value;
        this.convert();
    }

    setCategory(c: Category) {
        this.form.controls.category.setValue(c);
    }

    prev() {
        var today = new Date(this.form.controls.opdate.value);
        today.setDate(today.getDate() - 1);
        let tzoffset = today.getTimezoneOffset() * 60000;
        let localISOTime = (new Date(today.getTime() - tzoffset)).toISOString().slice(0, -1);
        this.form.controls.opdate.setValue(localISOTime.substr(0, 10))
    }

    today() {
        var today = new Date();
        let tzoffset = today.getTimezoneOffset() * 60000;
        let localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
        this.form.controls.opdate.setValue(localISOTime.substr(0, 10))
    }

    next() {
        var today = new Date(this.form.controls.opdate.value);
        today.setDate(today.getDate() + 1);
        let tzoffset = today.getTimezoneOffset() * 60000;
        let localISOTime = (new Date(today.getTime() - tzoffset)).toISOString().slice(0, -1);
        this.form.controls.opdate.setValue(localISOTime.substr(0, 10))
    }


    onSubmit({ value, valid }) {
        value.credit = this.form.controls.credit.value;
        value.debit = this.form.controls.debit.value;
        value.currency = this.form.controls.ttype.value == 0 ? null : (this.form.controls.ttype.value == 1 ? this.form.controls.rcurrency.value : this.form.controls.acurrency.value).toLocaleUpperCase();
        value.cname = this.add_category && value.ttype ? value.cname : null;
        let tzoffset = (new Date()).getTimezoneOffset() * 60000;
        let localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
        value.opdate += localISOTime.substr(10)
        this.form.markAsPristine(); // to stop converting
        this.save.emit(value);
    }

    onCancel() {
        this.location.back();
    }

    convert() {
        if (this.form.pristine) {
            return;
        }
        let direction = this.form.controls.credit.dirty || (this.form.controls.debit.pristine && this.form.controls.ttype.value != 1);
        let value = direction ? this.form.controls.credit.value : this.form.controls.debit.value;
        let currency = (direction ? this.form.controls.acurrency.value : this.form.controls.rcurrency.value).toLocaleUpperCase();
        let target = (direction ? this.form.controls.rcurrency.value : this.form.controls.acurrency.value).toLocaleUpperCase();
        let control = direction ? this.form.controls.debit : this.form.controls.credit;
        if (currency == target) {
            control.setValue(value, { onlySelf: true, emitEvent: false });
        } else if (control.pristine && currency.length == 3 && target.length == 3) {
            this.backend.convert(value, currency, target).toPromise().then(v => control.setValue(v, { onlySelf: true, emitEvent: false }));
        }
    }
}
