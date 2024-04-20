import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { _MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-grade-report',
  templateUrl: './grade-report.component.html',
  styleUrls: ['./grade-report.component.scss']
})
export class GradeReportComponent implements OnInit {

  minToDate!: any;
  currentDate: Date | null = new Date();
  gradeReportForm!: FormGroup;
  dataSource = new _MatTableDataSource<any>();
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'ClientName', header: 'Client Name' },
  
  ]
  displayedColumns: string[] = [];


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  selectedRowIndex: number = -1;

  constructor(
    private fb:FormBuilder
  ){}

  ngOnInit(): void {
    this.gradeReportForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required]
    });
    this.dataSource.data = [
      {
        ClientName:'ABC',
        A:'',
        B:'',
        C:'',
        D:'',
      }
    ];
    this.displayedColumns = Object.keys(this.dataSource.data[0]);
  }

  ngAfterViewInit() {

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  fromDateChange(event: MatDatepickerInputEvent<Date>): void {
    this.gradeReportForm.controls['toDate'].setValue(null);
    this.minToDate = event.value;
  }

  search(){

  }

  selectRow(row: any, index: number) {
    this.selectedRowIndex = index; // Set the selected row index
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardNavigation(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      if (this.selectedRowIndex < this.dataSource.data.length - 1) {
        this.selectedRowIndex++;
      }
    } else if (event.key === 'ArrowUp') {
      if (this.selectedRowIndex > 0) {
        this.selectedRowIndex--;
      }
    }
  }

}
