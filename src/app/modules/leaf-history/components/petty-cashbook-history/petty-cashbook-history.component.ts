import { formatDate } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { _MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { IGetPayment } from 'src/app/modules/accounts/interfaces/ipayment';
import { IGetWalletHistory } from 'src/app/modules/accounts/interfaces/iwallet';
import { PaymentService } from 'src/app/modules/accounts/services/payment.service';
import { WalletService } from 'src/app/modules/accounts/services/wallet.service';
import { IGetUser } from 'src/app/modules/user-management/interfaces/iuser';
import { UserService } from 'src/app/modules/user-management/services/user.service';
import { ExcelExportService } from 'src/app/shared/services/excel-export.service';

@Component({
  selector: 'app-petty-cashbook-history',
  templateUrl: './petty-cashbook-history.component.html',
  styleUrls: ['./petty-cashbook-history.component.scss']
})
export class PettyCashbookHistoryComponent implements OnInit {


  displayedColumns: string[] = [
    'CashBookId',
    'PaymentDate',
    'PaymentType',
    'Narration',
    'Amount',

  ];

  dataSource = new _MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'CashBookId', header: 'Transcation Id' },
    { columnDef: 'PaymentDate', header: 'Date' },
    { columnDef: 'PaymentType', header: 'Payment Type' },
    { columnDef: 'Narration', header: 'Narration' },
    // { columnDef: 'Received', header: 'Received' },
    // { columnDef: 'Payment', header: 'Payment' },
    // { columnDef: 'Balance', header: 'Balance' },

  ];


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();
  loginDetails: any;
  PettyCashBookHistoryForm!: FormGroup;
  minToDate!: any;
  ClientNames: any[] = [];
  selectedRowIndex: number = -1;
  clientList: any[] = [];
  UserList: any[] = [];
  categoryList: any[] = [];
  PaymentTypeList: any[] = [];
  constructor(
    private toastr: ToastrService,
    private helper: HelperService,
    private fb: FormBuilder,
    private excelService: ExcelExportService,
    private walletService: WalletService,
    private userService: UserService,
  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.PettyCashBookHistoryForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required],
      UserId: ['', Validators.required]
    });

    await this.GetUserList();

    if (this.loginDetails.RoleName.toLowerCase() != 'admin') {

      const selectedClient = { UserId: this.loginDetails.UserId }; // Example selected client
      this.PettyCashBookHistoryForm.patchValue({
        UserId: selectedClient.UserId,
      });

      this.PettyCashBookHistoryForm.controls['UserId'].disable({ onlySelf: true });
    }
  }


  GetPettyCashBook() {

    const currentDate = new Date();
    let bodyData: IGetWalletHistory = {
      FromDate: formatDate(this.PettyCashBookHistoryForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
      ToDate: formatDate(this.PettyCashBookHistoryForm.value.toDate, 'yyyy-MM-dd', 'en-US'),
      TenantId: this.loginDetails.TenantId,
      UserId: this.PettyCashBookHistoryForm.controls["UserId"].value ?? 0,
      CreatedBy: this.loginDetails.RoleName != 'Admin' ? this.loginDetails.UserId : 0,

    };

    const categoryListService = this.walletService
      .GetPettyCashBook(bodyData)
      .subscribe((res: any) => {

        this.dataSource.data = res.CashBookData;
      });
    this.subscriptions.push(categoryListService);
  }





  async GetUserList() {
    let bodyData: IGetUser = {
      TenantId: this.loginDetails.TenantId,
    };
    const categoryListService = this.userService
      .GetUser(bodyData)
      .subscribe((res: any) => {

        this.UserList = res.UserDetails.filter((x: any) => x.RoleName.toLowerCase() != 'admin');
      });
    this.subscriptions.push(categoryListService);
  }



  displayWithFn(value: string): string {
    return value || '';
  }


  getRecivedTotal(columnName: string): number {
    return this.dataSource.filteredData.reduce(
      (acc, curr) => acc + curr[columnName],
      0
    );
  }

  getPaymentTotal(columnName: string): number {
    return this.dataSource.filteredData.reduce(
      (acc, curr) => acc + curr[columnName],
      0
    );
  }
  getBalance(): number {
    return this.dataSource.filteredData.reduce((acc, curr) => {
      const received = curr['Received'] || 0;
      const payment = curr['Payment'] || 0;
      return acc + (received - payment);
    }, 0);
  }




  filterClientNames(value: string): any[] {

    const filterValue = value.toLowerCase();
    return this.ClientNames.filter((x: any) => x?.ClientName?.toLowerCase()?.includes(filterValue));
  }
  ngAfterViewInit() {

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  selectClient(client: any) {
    if (client == '') {
      this.PettyCashBookHistoryForm.controls['ClientId'].reset();
    }

    this.PettyCashBookHistoryForm.controls['ClientId'].setValue(client?.ClientId);
  }

  search() {
    if (this.PettyCashBookHistoryForm.invalid) {
      this.PettyCashBookHistoryForm.markAllAsTouched();
      return;
    }
    this.GetPettyCashBook();


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
    //  this.PettyCashBookHistoryForm.controls['toDate'].setValue(null);
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
  editItem(e: any) {

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

        this.excelService.exportToExcel('material-table', 'Payment History');
      } else {
        console.error("Table element not found or not an HTML table.");
      }
    } else {
      this.toastr.warning("NO DATA TO EXPORT", "WARNING");
    }
  }

}

