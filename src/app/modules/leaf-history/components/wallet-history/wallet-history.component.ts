import { formatDate } from '@angular/common';
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
import { IGetWalletHistory } from 'src/app/modules/accounts/interfaces/iwallet';
import { PaymentService } from 'src/app/modules/accounts/services/payment.service';
import { WalletService } from 'src/app/modules/accounts/services/wallet.service';
import { IGetUser } from 'src/app/modules/user-management/interfaces/iuser';
import { UserService } from 'src/app/modules/user-management/services/user.service';
import { ExcelExportService } from 'src/app/shared/services/excel-export.service';

@Component({
  selector: 'app-wallet-history',
  templateUrl: './wallet-history.component.html',
  styleUrls: ['./wallet-history.component.scss']
})
export class WalletHistoryComponent implements OnInit {


  displayedColumns: string[] = [
    'WalletId',
    'TransactionDate',
    // 'FullName',
    'Narration',
    'Received',
    'Payment',
    'Balance',
  ];

  dataSource = new _MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'WalletId', header: 'Transcation Id' },
    { columnDef: 'TransactionDate', header: 'Date' },
    // { columnDef: 'FullName', header: 'User Name' },
    // { columnDef: 'Narration', header: 'Narration' },
    // { columnDef: 'Received', header: 'Received' },
    // { columnDef: 'Payment', header: 'Payment' },
    // { columnDef: 'Balance', header: 'Balance' },

  ];


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();
  loginDetails: any;
  WalletHistoryForm!: FormGroup;
  minToDate!: any;
  ClientNames: any[] = [];
  selectedRowIndex: number = -1;
  clientList: any[] = [];
  UserList: any[] = [];
  categoryList: any[] = [];
  PaymentTypeList: any[] = [];
  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private helper: HelperService,
    private fb: FormBuilder,
    private excelService: ExcelExportService,
    private walletService: WalletService,
    private paymentService: PaymentService,
    private userService: UserService,
  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.WalletHistoryForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required],
      UserId: ['', Validators.required]
    });

    await this.GetUserList();

    if (this.loginDetails.RoleName.toLowerCase() != 'admin') {

      const selectedClient = { UserId: this.loginDetails.UserId }; // Example selected client
      this.WalletHistoryForm.patchValue({
        UserId: selectedClient.UserId,
      });

      this.WalletHistoryForm.controls['UserId'].disable({ onlySelf: true });
    }
  }


  GetWalletHistory() {
    const currentDate = new Date();
    let bodyData: IGetWalletHistory = {
      FromDate: formatDate(this.WalletHistoryForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
      ToDate: formatDate(this.WalletHistoryForm.value.toDate, 'yyyy-MM-dd', 'en-US'),
      TenantId: this.loginDetails.TenantId,
      UserId: this.WalletHistoryForm.controls["UserId"].value ?? 0,
      CreatedBy: this.loginDetails.RoleName != 'Admin' ? this.loginDetails.UserId : 0,

    };

    const categoryListService = this.walletService
      .GetWalletStatement(bodyData)
      .subscribe((res: any) => {

        this.dataSource.data = res.WalletStatement;
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


  search() {
    if (this.WalletHistoryForm.invalid) {
      this.WalletHistoryForm.markAllAsTouched();
      return;
    }
    this.GetWalletHistory();


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
