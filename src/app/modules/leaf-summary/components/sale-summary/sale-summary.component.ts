import { DatePipe, formatDate } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { _MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { IGetTeaClient } from 'src/app/modules/collection/interfaces/istg';
import { AutoCompleteService } from 'src/app/modules/collection/services/auto-complete.service';
import { IGetFactory } from 'src/app/modules/masters/interfaces/IFactory';
import { FactoryAccountService } from 'src/app/modules/masters/services/factory-account.service';
import { FactoryService } from 'src/app/modules/masters/services/factory.service';
import { SaleSummaryService } from '../../services/sale-summary.service';
import { ISaleSummary } from '../../interfaces/isale-summary';
import { ExcelExportService } from '../../../../shared/services/excel-export.service';

@Component({
  selector: 'app-sale-summary',
  templateUrl: './sale-summary.component.html',
  styleUrls: ['./sale-summary.component.scss']
})
export class SaleSummaryComponent implements OnInit {

  displayedColumns: string[] = [
    'FactoryName',
    'AccountName',
    'ChallanWeight',
    'Rate',
    'GrossAmount',
    'Incentive',
    'FinalAmount'
  ];

  dataSource = new _MatTableDataSource<any>();

  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'FactoryName', header: 'Factory Name' },
    { columnDef: 'AccountName', header: 'Account Name' },

  ]


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();
  loginDetails: any;
  saleSummary!: FormGroup;
  minToDate!: any;
  factoryNames: any[] = [];
  selectedRowIndex: number = -1;
  FactoryList: any[] = [];
  filteredFactory: any[] = [];
  accountNames: any[] = [];
  filteredAccounts: any[] = [];
  AccountList: any[] = [];
  AverageRate: number = 0;
  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private helper: HelperService,
    private datePipe: DatePipe,
    private excelService: ExcelExportService,
    private factoryService: FactoryService,
    private accountService: FactoryAccountService,
    private fb: FormBuilder,
    private summaryService: SaleSummaryService,
  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.saleSummary = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required],
      FactoryName: [''],
      FactoryId: [0],
      AccountId: [0],
      AccountName:['']
    });
    await this.GetFactoryList();
    await this.GetFactoryAccountList();
  }

  displayWithFn(value: string): string {
    return value || '';
  }


  getTotal(columnName: string): number {
    return this.dataSource.filteredData.reduce(
      (acc, curr) => acc + curr[columnName],
      0
    );
  }


  ngAfterViewInit() {

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async GetSummary() {
    try {
      const bodyData: ISaleSummary = {
        FromDate: formatDate(this.saleSummary.value.fromDate, 'yyyy-MM-dd', 'en-US'),
        ToDate: formatDate(this.saleSummary.value.toDate, 'yyyy-MM-dd', 'en-US'),
        FactoryId: this.saleSummary.value.FactoryId ?? 0,
        AccountId: this.saleSummary.value.AccountId ?? 0,
        TenantId: this.loginDetails.TenantId

      };
      const res: any = await this.summaryService.GetSaleSummary(bodyData).toPromise();
      const { SaleSummary } = res;

      this.dataSource.data = SaleSummary;


    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }

  async search() {

    if (this.saleSummary.invalid) {
      this.saleSummary.markAllAsTouched();
      return;
    }
    await this.GetSummary();

    const grossAmount: number = this.getTotal('GrossAmount');
    const finalWeight: number = this.getTotal('ChallanWeight');
    this.AverageRate = grossAmount / finalWeight;
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  selectRow(row: any, index: number) {
    this.selectedRowIndex = index; // Set the selected row index
  }
  fromDateChange(event: MatDatepickerInputEvent<Date>): void {
   // this.saleSummary.controls['toDate'].setValue(null);
    this.minToDate = event.value;
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

  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    // Do something when input changes
    console.log(input.value, 'presss');
    if (input.value == '') {
      this.accountNames = [];
      this.saleSummary.controls['FactoryId'].reset();
      this.saleSummary.controls['FactoryName'].reset();
      this.saleSummary.controls['AccountName'].reset();
      this.saleSummary.controls['AccountId'].reset();


    }

  }
  filterAccountNames(value: string): any {
    const filterValue = value.toLowerCase();
    return this.accountNames.filter((x: any) =>
      x?.AccountName?.toLowerCase()?.includes(filterValue)
    );
  }

  selectAccount(account: any) {
    this.saleSummary.controls['AccountId'].setValue(account?.AccountId);
  }
  filterFactoryNames(value: string): any {
    const filterValue = value.toLowerCase();
    return this.factoryNames.filter((x: any) =>
      x?.FactoryName?.toLowerCase()?.includes(filterValue)
    );
  }
  async GetFactoryList() {
    try {
      const bodyData: IGetFactory = {
        TenantId: this.loginDetails.TenantId,
        IsClientView: false,
      };

      const res: any = await this.factoryService
        .GetFactory(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.factoryNames = res.FactoryDetails;

    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }

  async GetFactoryAccountList() {
    try {
      const bodyData: IGetFactory = {
        TenantId: this.loginDetails.TenantId,
        IsClientView: false,
      };

      const res: any = await this.accountService
        .GetFactoryAccount(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.AccountList = res.AccountDetails;
    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }

  filterBuyers(value: string) {
    const filterValue = value.toLowerCase();
    this.filteredFactory = this.FactoryList.filter((buyer: any) =>
      buyer.FactoryName.toLowerCase().includes(filterValue)
    );
  }

  selectFactory(factory: any) {
    this.saleSummary.controls['FactoryId'].setValue(factory?.FactoryId);
    this.accountNames = this.AccountList.filter((x: any) => x.FactoryId == factory.FactoryId)
  }

  filterAccounts(value: string) {
    const filterValue = value.toLowerCase();
    this.filteredAccounts = this.AccountList.filter((account: any) =>
      account.AccountName.toLowerCase().includes(filterValue)
    );
  }

  exportToExcel(){
    if(this.dataSource.data.length > 0){
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

        this.excelService.exportToExcel('material-table', 'Sale Summary');
      } else {
        console.error("Table element not found or not an HTML table.");
      }
    } else {
      this.toastr.warning("NO DATA TO EXPORT", "WARNING");
    }
  }

}
