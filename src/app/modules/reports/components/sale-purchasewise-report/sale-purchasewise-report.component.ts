import { DatePipe, formatDate } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { _MatTableDataSource } from '@angular/material/table';
import { Subject, Subscription } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { ExcelExportService } from 'src/app/shared/services/excel-export.service';
import { ReportsServiceService } from '../../services/reports-service.service';
import { IReports } from '../../interfaces/ireports';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { ToastrService } from 'ngx-toastr';

// interface MonthWiseData {
//   Months: string;
//   FactoryName: string;
//   AccountName: string;
//   ChallanWeight: number;
//   AvgRate: number;
//   TotalWeight: number;
//   rowspan: number;
//   showRow: boolean;
// }

@Component({
  selector: 'app-sale-purchasewise-report',
  templateUrl: './sale-purchasewise-report.component.html',
  styleUrls: ['./sale-purchasewise-report.component.scss']
})


export class SalePurchasewiseReportComponent implements OnInit {
  
  displayedColumns: string[] = [
    'Months',
    'FactoryName',
    'AccountName',
    'ChallanWeight',
    'AvgRate',
    'TotalWeight'
  

  ];

  dataSource = new _MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
   // { columnDef: 'Months', header: 'Months' },
    // { columnDef: 'BillDate', header: 'Bill Date' },
    // { columnDef: 'FactoryName', header: 'FactoryName' },
    // { columnDef: 'AccountName', header: 'AccountName' },

  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();
  loginDetails: any;
  SalePurchaseForm!: FormGroup;
  minToDate!: any;
  ClientNames: any[] = [];
  selectedRowIndex: number = -1;
  clientList: any[] = [];
  categoryList: any[] = [];
 // monthWiseData:MonthWiseData[]=[];

  constructor(

    private helper: HelperService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private excelService: ExcelExportService,
    private reportService: ReportsServiceService,
    private toastr: ToastrService,


  ) { }
  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.SalePurchaseForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required]

    });

  }

  
  GetBillHistory() {
    const currentDate = new Date();
    let bodyData: IReports = {
      FromDate: formatDate(this.SalePurchaseForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
      ToDate: formatDate(this.SalePurchaseForm.value.toDate, 'yyyy-MM-dd', 'en-US'),
      TenantId: this.loginDetails.TenantId,

    };

    const categoryListService = this.reportService
      .GetSalePurchaseWiseReport(bodyData)
      .subscribe((res: any) => {
        // console.log(res);
        this.dataSource.data = res.SaleWiseReport;

     //   this.monthWiseData =  res.SaleWiseReport;
      //  this.dataSource.data=this.monthWiseData;
      });
    this.subscriptions.push(categoryListService);
  }


  // preprocessData(data: MonthWiseData[]): MonthWiseData[] {
  //   const groupedData = data.reduce((acc:any, curr) => {
  //     const month = curr.Months;
  //     if (!acc[month]) {
  //       acc[month] = { ...curr, rowspan: 1, showRow: true };
  //     } else {
  //       acc[month].rowspan++;
  //       curr.showRow = false;
  //     }
  //     return acc;
  //   }, {});

  //   return Object.values(groupedData);
  // }

  // getTotalWeight(): number {
  //   return this.monthWiseData.map((t:any) => t.ChallanWeight).reduce((acc, value) => acc + value, 0);
  // }
  getTotal(columnName: string): number {
    return this.dataSource.filteredData.reduce(
      (acc, curr) => acc + curr[columnName],
      0
    );
  }

  filterClientNames(value: string): any[] {
    const filterValue = value.toLowerCase().trim(); // Trim whitespace for more accurate filtering

    return this.ClientNames.filter(x =>
      x?.ClientName?.toLowerCase().includes(filterValue)
    );
  }
  selectRow(row: any, index: number) {
    this.selectedRowIndex = index; // Set the selected row index
  }
  ngAfterViewInit() {

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


  search() {
    this.GetBillHistory();
  }
  displayWithFn(value: string): string {
    return value || '';
  }

  fromDateChange(event: MatDatepickerInputEvent<Date>): void {
    //  this.SupplierBillForm.controls['toDate'].setValue(null);
    this.minToDate = event.value;
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  exportToExcel() {
    if (this.dataSource.data.length > 0) {
      // Get the table element
      const table = document.getElementById('material-table');

      if (table instanceof HTMLTableElement) { // Check if table is a HTMLTableElement
        // Remove unwanted columns
        const columnsToRemove = ['Id', 'Actions', 'Created By']; // Specify columns to remove
        columnsToRemove.forEach(col => {
          const columnIndex = Array.from(table.rows[0].cells).findIndex(cell => cell.textContent && cell.textContent.trim() === col);
          if (columnIndex !== -1) {
            Array.from(table.rows).forEach(row => {
              if (row.cells[columnIndex]) {
                row.deleteCell(columnIndex);
              }
            });
          }
        });

        this.excelService.exportToExcel('material-table', 'Supplier Bill History');
      } else {
        console.error("Table element not found or not an HTML table.");
      }
    } else {
      this.toastr.warning("NO DATA TO EXPORT", "WARNING");
    }
  }
}
