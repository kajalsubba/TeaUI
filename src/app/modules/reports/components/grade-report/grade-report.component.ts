import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { _MatTableDataSource } from '@angular/material/table';
import { ReportsServiceService } from '../../services/reports-service.service';
import { IReports } from '../../interfaces/ireports';
import { formatDate } from '@angular/common';
import { HelperService } from 'src/app/core/services/helper.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-grade-report',
  templateUrl: './grade-report.component.html',
  styleUrls: ['./grade-report.component.scss']
})
export class GradeReportComponent implements OnInit {
  loginDetails: any;
  minToDate!: any;
  currentDate: Date | null = new Date();
  gradeReportForm!: FormGroup;
  dataSource = new _MatTableDataSource<any>();
  displayedColumns: string[] = [];
  dynamicColumns: string[] = []; // Dynamic columns for calculation
  selectedRowIndex: number = -1;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private reportService: ReportsServiceService,
    private helper: HelperService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.gradeReportForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required]
    });

    // Fetch data on component load
    this.search();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  fromDateChange(event: MatDatepickerInputEvent<Date>): void {
    this.minToDate = event.value;
  }

  async search() {
    await this.GetGradeReports();
  }

  async GetGradeReports() {
    try {
      const bodyData: IReports = {
        FromDate: formatDate(this.gradeReportForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
        ToDate: formatDate(this.gradeReportForm.value.toDate, 'yyyy-MM-dd', 'en-US'),
        TenantId: this.loginDetails.TenantId
      };
      const res: any = await this.reportService.GetClientWiseGradeReport(bodyData).toPromise();
      const { GradeReport } = res;
      if (GradeReport.length > 0) {
        this.dataSource.data = GradeReport;
        this.displayedColumns = Object.keys(this.dataSource.data[0]).concat('Total');
        this.dynamicColumns = this.displayedColumns.filter(col => col !== 'ClientName' && col !== 'Total');
        this.dataSource.data.forEach(item => {
          for (const key in item) {
            if (item.hasOwnProperty(key) && item[key] === null) {
              item[key] = 0;
            }
          }
        });
      }
    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }

  getRowTotal(row: any) {
    return this.dynamicColumns.map(col => row[col]).reduce((acc, value) => acc + value, 0);
  }

  getColumnTotal(column: string) {
    return this.dataSource.data.map(t => t[column]).reduce((acc, value) => acc + value, 0);
  }

  getGrandTotal() {
    return this.dynamicColumns.map(col => this.getColumnTotal(col)).reduce((acc, value) => acc + value, 0);
  }

  selectRow(row: any, index: number) {
    this.selectedRowIndex = index;
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
