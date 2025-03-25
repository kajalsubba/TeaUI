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


export class Group {
  level = 0;
  parent: Group | undefined;
  expanded = true;
  totalCounts = 0;
  totalChallanWeight = 0;
  totalGrossAmount = 0;
  avgRate = 0;
  get visible(): boolean {
    return !this.parent || (this.parent.visible && this.parent.expanded);
  }
}


@Component({
  selector: 'app-sale-purchasewise-report',
  templateUrl: './sale-purchasewise-report.component.html',
  styleUrls: ['./sale-purchasewise-report.component.scss']
})


export class SalePurchasewiseReportComponent implements OnInit {

  displayedColumns: string[] = [
    'MonthYear',
    'FactoryName',
    'AccountName',
    'ChallanWeight',
    'AvgRate',
    'GrossAmount'

  ];

  dataSource = new _MatTableDataSource<any | Group>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'MonthYear', header: 'Month Year' },
    { columnDef: 'FactoryName', header: 'Factory' },
    { columnDef: 'AccountName', header: 'Account' },
    { columnDef: 'ChallanWeight', header: 'Challan Weight' },
    { columnDef: 'AvgRate', header: 'Avg. Rate' },
    { columnDef: 'GrossAmount', header: 'Final Amount' },


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
  groupByColumns: string[] = [];
  _alldata: any[] = [];
  AverageRate: number = 0;
  constructor(

    private helper: HelperService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private excelService: ExcelExportService,
    private reportService: ReportsServiceService,
    private toastr: ToastrService,


  ) {


  }
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
        this._alldata = res.SaleWiseReport;
        this.dataSource.data = this.addGroups(
          this._alldata, this.groupByColumns);

        
          const grossAmount: number = this.getTotal('GrossAmount');
          const finalWeight: number = this.getTotal('ChallanWeight');
          this.AverageRate = grossAmount / finalWeight;
          console.log(this._alldata, '   this.AverageRate ');

      });
    this.dataSource.filterPredicate = this.customFilterPredicate.bind(this);
    this.dataSource.filter = performance.now().toString();
    this.displayedColumns = this.columns.map((column) => column.columnDef);
    this.groupByColumns = ['MonthYear'];



    this.subscriptions.push(categoryListService);
  }

  // below is for grid row grouping
  customFilterPredicate(data: any | Group, filter: string): boolean {
    return data instanceof Group ? data.visible : this.getDataRowVisible(data);
  }

  getDataRowVisible(data: any): boolean {
    const groupRows = this.dataSource.data.filter((row) => {
      // if (!(row instanceof Group)) {
      //   return false;
      // }
      let match = true;

      this.groupByColumns.forEach((column: any) => {
        if (!row[column] || !data[column] || row[column] !== data[column]) {
          match = false;
        }
      });
      return match;
    });

    if (groupRows.length === 0) {
      return true;
    }
    const parent = groupRows[0] as Group;
    return parent.visible && parent.expanded;
  }

  groupHeaderClick(row: any) {
    row.expanded = !row.expanded;
    this.dataSource.filter = performance.now().toString(); // bug here need to fix
  }

  addGroups(data: any[], groupByColumns: string[]): any[] {
    const rootGroup = new Group();
    rootGroup.expanded = true;
    return this.getSublevel(data, 0, groupByColumns, rootGroup);
  }

  getSublevel(data: any[], level: number, groupByColumns: string[], parent: Group): any[] {
    if (level >= groupByColumns.length) {
      return data;
    }
    const groups = this.uniqueBy(
      data.map((row) => {
        const result: any = new Group();
        result.level = level + 1;
        result.parent = parent;
        for (let i = 0; i <= level; i++) {
          result[groupByColumns[i]] = row[groupByColumns[i]];
        }
        return result;
      }),
      JSON.stringify
    );

    const currentColumn = groupByColumns[level];
    let subGroups: any[] = [];
    groups.forEach((group: any) => {
      const rowsInGroup = data.filter(
        (row) => group[currentColumn] === row[currentColumn]
      );

      // Calculate totals for the group
      group.totalChallanWeight = rowsInGroup.reduce((acc, curr) => acc + curr.ChallanWeight, 0);
      group.totalGrossAmount = rowsInGroup.reduce((acc, curr) => acc + curr.GrossAmount, 0);
      group.avgRate = group.totalChallanWeight !== 0 ? group.totalGrossAmount / group.totalChallanWeight : 0;

      group.totalCounts = rowsInGroup.length;
      const subGroup = this.getSublevel(rowsInGroup, level + 1, groupByColumns, group);

      subGroup.unshift(group);
      // Add total row with calculated values
      const totalRow = {
        isTotalRow: true,
        totalChallanWeight: group.totalChallanWeight,
        totalGrossAmount: group.totalGrossAmount,
        avgRate: group.avgRate,
      };
      subGroup.push(totalRow); // Add total row with calculated values


      subGroups = subGroups.concat(subGroup);
      //  console.log(subGroups,'subGroups');
    });
    return subGroups;
  }

  uniqueBy(a: any, key: any) {
    const seen: any = {};
    return a.filter((item: any) => {
      const k = key(item);
      return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    });
  }

  isTotalRow(index: any, item: any): boolean {
    return item.isTotalRow;
  }
  isGroup(index: any, item: any): boolean {
    return item.level;
  }

  getTotal(columnName: string): number {
    return this._alldata.reduce(
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

    // this.dataSource.paginator = this.paginator;
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

        this.excelService.exportToExcel('material-table', 'SaleBreakUp Report');
      } else {
        console.error("Table element not found or not an HTML table.");
      }
    } else {
      this.toastr.warning("NO DATA TO EXPORT", "WARNING");
    }
  }




}
