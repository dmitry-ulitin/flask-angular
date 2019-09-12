import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Filter } from '../models/filter';

@Component({
  selector: 'app-period-filter',
  templateUrl: 'period-filter.component.html',
  styleUrls:['period-filter.component.css']
})
export class PeriodFilterComponent implements OnInit {
  @Input('filter') filter: Filter;
  @Output('setFilter') setFilter = new EventEmitter<Filter>();
  private year:string = new Date().getFullYear().toString();
  private month:string = new Date().toLocaleString('default', { month: 'long' });

  constructor() { }

  ngOnInit() {
  }

  isFilterEmpty():boolean {
    return this.filter == null;
  }

  isYear():boolean {
    return this.filter && this.filter.name == this.year;
  }

  isMonth():boolean {
    return this.filter && this.filter.name == this.month;
  }

  isPrev():boolean {
    return this.filter && this.filter.period.start != null;
  }

  isNext():boolean {
    return this.filter && this.filter.period.finish != null;
  }

  setEmpty():void {
    this.setFilter.emit({name: 'All Time', period: {start: null, finish: null}});
  }

  setMonth(date: Date = new Date()): void {
    let start = new Date(date.getFullYear(), date.getMonth(), 1);
    let finish = new Date().getFullYear() == start.getFullYear() && new Date().getMonth() == start.getMonth() ? null : new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);
    let name = start.toLocaleString('default', { month: 'long' });
    this.setFilter.emit({name: name, period: {start: start.toISOString(), finish: finish ? finish.toISOString() : null}});
  }

  setYear(date: Date = new Date()): void {
    let start = new Date(date.getFullYear(), 1, 1);
    let finish = new Date().getFullYear() == start.getFullYear() ? null :  new Date(start.getFullYear(), 12, 31, 23, 59, 59, 999);
    let name = start.getFullYear().toString();
    this.setFilter.emit({name: name, period: {start: start.toISOString(), finish: finish ? finish.toISOString() : null}});
  }

  prev(): void {
    if (this.filter != null) {
      let start = new Date(this.filter.period.start);
      if (this.filter.name.match(/^\d{4}$/)) {
        this.setYear(new Date(start.getFullYear() - 1, 1, 1))
      } else {
        this.setMonth(new Date(start.getFullYear(), start.getMonth() - 1, 1));
      }
    }
  }

  next(): void {
    if (this.filter != null && this.filter.period.finish != null) {
      let start = new Date(this.filter.period.start);
      if (this.filter.name.match(/^\d{4}$/)) {
        this.setYear(new Date(start.getFullYear() + 1, 1, 1))
      } else {
        this.setMonth(new Date(start.getFullYear(), start.getMonth() + 1, 1));
      }
    }
  }
}
