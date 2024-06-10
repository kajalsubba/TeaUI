import { DatePipe, formatDate, registerLocaleData } from '@angular/common';
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
import { GetstgBill, IPrint } from '../../interfaces/istgbill-history';
import { StgBillService } from '../../services/stg-bill.service';
import enIN from '@angular/common/locales/en-IN';
import { ExcelExportService } from '../../../../shared/services/excel-export.service';
registerLocaleData(enIN);
@Component({
  selector: 'app-stg-bill-history',
  templateUrl: './stg-bill-history.component.html',
  styleUrls: ['./stg-bill-history.component.scss']
})
export class StgBillHistoryComponent implements OnInit {

  displayedColumns: string[] = [
    'BillId',
    'BillDate',
    'BillPeriod',
    'ClientName',
    'AvgRate',
    'FinalWeight',
    'TotalStgAmount',
    'TotalStgPayment',
    'IncAmount',
    'TransportingAmount',
    'PreviousBalance',
    'CessAmount',
    'LessSeasonAdv',
    'AmountToPay',
    'actions',

  ];

  dataSource = new _MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'BillId', header: 'Bill No' },
    // { columnDef: 'BillDate', header: 'Bill Date' },
    { columnDef: 'BillPeriod', header: 'Bill Period' },
    { columnDef: 'ClientName', header: 'Client Name' },
    //{ columnDef: 'FinalWeight', header: 'Final Weighht' },
    //{ columnDef: 'AvgRate', header: 'Avg. Rate' },
    // { columnDef: 'TotalStgAmount', header: 'Total Amount' },
    // { columnDef: 'TotalStgPayment', header: 'Total Payment' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();
  loginDetails: any;
  StgBillForm!: FormGroup;
  minToDate!: any;
  ClientNames: any[] = [];
  selectedRowIndex: number = -1;
  clientList: any[] = [];
  categoryList: any[] = [];


  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private helper: HelperService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private excelService: ExcelExportService,
    private autocompleteService: AutoCompleteService,
    private billService: StgBillService,
    //  private paymentService: PaymentService,
    //   private stgapproveService: StgApproveService,
    // private supplierApproveService: SupplierapproveService
  ) { }
  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.StgBillForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required],
      ClientId: [0],
      ClientName: [''],

    });


    await this.loadClientNames();


  }
  async loadClientNames() {
    try {
      const bodyData: IGetTeaClient = {
        TenantId: this.loginDetails.TenantId,
        Category: 'STG'

      };

      const res: any = await this.autocompleteService.GetClientNames(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.ClientNames = res.ClientDetails;


    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }

  GetBillHistory() {
    const currentDate = new Date();
    let bodyData: GetstgBill = {
      FromDate: formatDate(this.StgBillForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
      ToDate: formatDate(this.StgBillForm.value.toDate, 'yyyy-MM-dd', 'en-US'),
      TenantId: this.loginDetails.TenantId,
      ClientId: this.StgBillForm.value.ClientId ?? 0

    };
 //   console.log(bodyData, 'bodyData bodyData');

    const categoryListService = this.billService
      .GetStgBillHistory(bodyData)
      .subscribe((res: any) => {
        // console.log(res);
        this.dataSource.data = res.BillHistory;
      });
    this.subscriptions.push(categoryListService);
  }

  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;

    // Reset ClientId and ClientName if input value is empty
    if (input.value === '') {
      this.StgBillForm.get('ClientId')?.reset();
      this.StgBillForm.get('ClientName')?.reset();
    }
  }
  getTotal(columnName: string): number {
    return this.dataSource.filteredData.reduce(
      (acc, curr) => acc + curr[columnName],
      0
    );
  }
  // filterClientNames(value: string): any[] {

  //   const filterValue = value.toLowerCase();
  //   return this.ClientNames.filter((x: any) => x?.ClientName?.toLowerCase()?.includes(filterValue));
  // }

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
  selectClient(client: any) {
    if (client == '') {
      this.StgBillForm.controls['ClientId'].reset();
    }
    console.log(client.ClientId, 'Client');

    this.StgBillForm.controls['ClientId'].setValue(client?.ClientId);
  }

  search() {
    this.GetBillHistory();
  }
  displayWithFn(value: string): string {
    return value || '';
  }

  ViewBill(e: any) {
    let bodyData: IPrint = {

      TenantId: this.loginDetails.TenantId,
      BillNo: e.BillId

    };
   // console.log(e, 'bodyData bodyData');

    const categoryListService = this.billService
      .PrintBill(bodyData)
      .subscribe((response: Blob) => {
        const blobUrl = URL.createObjectURL(response);

        // Open PDF in a new browser tab
        window.open(blobUrl, '_blank');
      });
    this.subscriptions.push(categoryListService);
  }

  fromDateChange(event: MatDatepickerInputEvent<Date>): void {
    // this.StgBillForm.controls['toDate'].setValue(null);
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

        this.excelService.exportToExcel('material-table', 'STG Bill History');
      } else {
        console.error("Table element not found or not an HTML table.");
      }
    } else {
      this.toastr.warning("NO DATA TO EXPORT", "WARNING");
    }
  }
}
