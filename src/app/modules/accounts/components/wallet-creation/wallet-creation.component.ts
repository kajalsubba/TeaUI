import { formatDate } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { _MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { environment } from 'src/environments/environment';
import { AddEditWalletComponent } from '../../models/add-edit-wallet/add-edit-wallet.component';
import { IGetWalletHistory } from '../../interfaces/iwallet';
import { IGetUser } from 'src/app/modules/user-management/interfaces/iuser';
import { UserService } from 'src/app/modules/user-management/services/user.service';
import { WalletService } from '../../services/wallet.service';

@Component({
  selector: 'app-wallet-creation',
  templateUrl: './wallet-creation.component.html',
  styleUrls: ['./wallet-creation.component.scss']
})
export class WalletCreationComponent implements OnInit {

  displayedColumns: string[] = [
    'WalletId',
    'WalletDate',
    'FullName',
    'Amount',
    'BalanceAmount'
  ];

  dataSource = new _MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'WalletId', header: 'Transcation Id' },
    { columnDef: 'WalletDate', header: 'Payment Date' },
    { columnDef: 'FullName', header: 'User Name' },
    { columnDef: 'Narration', header: 'Narration' },
    { columnDef: 'BalanceAmount', header: 'Balance' },

  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();
  loginDetails: any;
  WalletForm!: FormGroup;
  minToDate!: any;
  userList: any[] = [];
  selectedRowIndex: number = -1;

  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private helper: HelperService,
    private walletService: WalletService,
    private fb: FormBuilder,
    private userService: UserService

  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.WalletForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required],
      UserId: [0],
      FullName: [''],
    });

    await this.GetUserList();
  }


  GetWalletHistory() {

    const currentDate = new Date();
    let bodyData: IGetWalletHistory = {
      FromDate: formatDate(this.WalletForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
      ToDate: formatDate(this.WalletForm.value.toDate, 'yyyy-MM-dd', 'en-US'),
      TenantId: this.loginDetails.TenantId,
      UserId: this.WalletForm.value.UserId ?? 0,
      CreatedBy: 0
    };

    const categoryListService = this.walletService
      .GetWalletHistory(bodyData)
      .subscribe((res: any) => {

        this.dataSource.data = res.WalletHistory;
      });
    this.subscriptions.push(categoryListService);
  }


  displayWithFn(value: string): string {
    return value || '';
  }

  async GetUserList() {

    try {
      const categoryBody: IGetUser = {
        TenantId: this.loginDetails.TenantId,
      };

      const res: any = await this.userService
        .GetUser(categoryBody)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.userList = res.UserDetails.filter((x: any) => x.RoleName.toLowerCase() != 'admin');

    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }


  getTotal(columnName: string): number {
    return this.dataSource.filteredData.reduce(
      (acc, curr) => acc + curr[columnName],
      0
    );
  }
  filterFullNames(value: string): any[] {
    if (value == '') {
      this.WalletForm.controls['UserId'].reset();
    }
    const filterValue = value.toLowerCase();
    return this.userList.filter((x: any) => x?.FullName?.toLowerCase()?.includes(filterValue));

  }
  ngAfterViewInit() {

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }



  selectClient(user: any) {
    if (user == '') {
      this.WalletForm.controls['UserId'].reset();
    }
    if (!environment.production) {
      console.log(user.ClientId, 'Client');
    }
    this.WalletForm.controls['UserId'].setValue(user?.UserId);
  }

  search() {
    debugger
    if (this.WalletForm.invalid) {
      this.WalletForm.markAllAsTouched();
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

  AddPayment() {
    const dialogRef = this.dialog.open(AddEditWalletComponent, {
      width: window.innerWidth <= 1024 ? '40%' : '30%',
      data: {
        title: 'Add Wallet Entry',
        buttonName: 'Save',
      },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.GetWalletHistory();

      }
    });
  }

  editItem(element: any) {
    const dialogRef = this.dialog.open(AddEditWalletComponent, {
      width: window.innerWidth <= 1024 ? '40%' : '30%',
      data: {
        title: 'Update Payment Entry',
        buttonName: 'Update',
        value: element,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.GetWalletHistory();

      }
    });
  }

}

