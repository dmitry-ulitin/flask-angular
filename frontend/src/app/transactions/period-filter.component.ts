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
  private month:string = new Date().toLocaleString('default', { month: 'long' });

  constructor() { }

  ngOnInit() {
  }

  isFilterEmpty():boolean {
    return this.filter == null;
  }

  setEmpty():void {
    this.setFilter.emit(null);
  }

  setMonth(date: Date = new Date()): void {
    let start = new Date(date.getFullYear(), date.getMonth(), 1);
    let finish = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);
    let name = start.toLocaleString('default', { month: 'long' });
    this.setFilter.emit({name: name, period: {start: start.toISOString(), finish: finish.toISOString()}});
  }

  setYear(date: Date = new Date()): void {
    let start = new Date(date.getFullYear(), 1, 1);
    let finish = new Date(start.getFullYear(), 12, 31, 23, 59, 59, 999);
    let name = start.getFullYear().toString();
    this.setFilter.emit({name: name, period: {start: start.toISOString(), finish: finish.toISOString()}});
  }

  prev(): void {
    if (this.filter != null) {
      let start = new Date(this.filter.period.start);
      if (this.filter.name.match('^\d{4}$')) {
        this.setYear(new Date(start.getFullYear() - 1, 1, 1))
      } else {
        this.setMonth(new Date(start.getFullYear(), start.getMonth() - 1, 1));
      }
    }
  }

  next(): void {
    if (this.filter != null && this.filter.period.finish != null) {
      let start = new Date(this.filter.period.start);
      if (this.filter.name.match('^\d{4}$')) {
        this.setYear(new Date(start.getFullYear() + 1, 1, 1))
      } else {
        this.setMonth(new Date(start.getFullYear(), start.getMonth() + 1, 1));
      }
    }
  }
}
