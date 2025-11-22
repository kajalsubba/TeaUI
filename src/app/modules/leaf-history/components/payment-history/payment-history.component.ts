import { DatePipe, formatDate, registerLocaleData } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { _MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { IGetPayment } from 'src/app/modules/accounts/interfaces/ipayment';
import { PaymentService } from 'src/app/modules/accounts/services/payment.service';
import { IGetTeaClient } from 'src/app/modules/collection/interfaces/istg';
import { AutoCompleteService } from 'src/app/modules/collection/services/auto-complete.service';
import { IGetCategory } from 'src/app/modules/masters/interfaces/ICategory';
import { IGetPaymentType } from 'src/app/modules/masters/interfaces/ipayment-type';
import { CategoryService } from 'src/app/modules/masters/services/category.service';
import { PaymenttypeService } from 'src/app/modules/masters/services/paymenttype.service';
import enIN from '@angular/common/locales/en-IN';
import { UserService } from 'src/app/modules/user-management/services/user.service';
import { IGetUser } from 'src/app/modules/user-management/interfaces/iuser';
import { ExcelExportService } from '../../../../shared/services/excel-export.service';
registerLocaleData(enIN);
@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss']
})
export class PaymentHistoryComponent implements OnInit {

  displayedColumns: string[] = [
    'BillDate',
    'PaymentDate',
    'PaySource',
    'ClientName',
    'PaymentType',
    'Amount',
    'Narration',
    'PaymentSource',
    'CreatedBy',
    'CreatedDate'

  ];

  dataSource = new _MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'BillDate', header: 'Bill Date' },
    { columnDef: 'PaymentDate', header: 'Payment Date' },
    // { columnDef: 'ClientName', header: 'Client Name' },
    { columnDef: 'PaySource', header: 'Category' },
    // { columnDef: 'PaymentType', header: 'Payment Type' },
    { columnDef: 'Narration', header: 'Narration' },
    { columnDef: 'PaymentSource', header: 'Source' },
    { columnDef: 'CreatedBy', header: 'Created By' },
    { columnDef: 'CreatedDate', header: 'Created DateTime' },
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();
  loginDetails: any;
  PaymentForm!: FormGroup;
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
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private excelService: ExcelExportService,
    private autocompleteService: AutoCompleteService,
    private categoryService: CategoryService,
    private paymentService: PaymentService,
    private paymentTypeService: PaymenttypeService,
    private userService: UserService,
    // private supplierApproveService: SupplierapproveService
  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.PaymentForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required],
      ClientId: [0],
      ClientName: [''],
      CategoryId: ['', Validators.required],
      CategoryName: [''],
      PaymentTypeId: [0],
      UserId: [0]
    });

    //  await this.loadVehicleNumbers(formatDate(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd', 'en-US'));
    await this.getCategoryList();
    await this.loadClientNames();
    await this.GetPaymentType();
    await this.GetUserList();
  }

  GetPaymentData() {
    const currentDate = new Date();
    let bodyData: IGetPayment = {
      FromDate: formatDate(this.PaymentForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
      ToDate: formatDate(this.PaymentForm.value.toDate, 'yyyy-MM-dd', 'en-US'),
      TenantId: this.loginDetails.TenantId,
      ClientCategory: this.PaymentForm.value.CategoryName ?? '',
      ClientId: this.PaymentForm.value.ClientId ?? 0,
      PaymentTypeId: this.PaymentForm.value.PaymentTypeId ?? 0,
      CreatedBy: this.loginDetails.RoleName != 'Admin' ? this.loginDetails.UserId : this.PaymentForm.value.UserId,

    };

    const categoryListService = this.paymentService
      .GetPaymentData(bodyData)
      .subscribe((res: any) => {

        this.dataSource.data = res.PaymentDetails;
      });
    this.subscriptions.push(categoryListService);
  }


  async selectCategory(event: MatOptionSelectionChange, category: any) {
    if (event.source.selected) {
      this.PaymentForm.controls['ClientId'].reset();
      this.PaymentForm.controls['ClientName'].reset();
      this.PaymentForm.controls['CategoryName'].setValue(category?.CategoryName);

      if (!category) {
        this.ClientNames = this.clientList;
      } else {
        const dataList = this.clientList.filter((x: any) =>
          x.CategoryName.toLowerCase() === this.PaymentForm.value.CategoryName.toLowerCase() ||
          x.CategoryName.toLowerCase() === 'both'
        );
        this.ClientNames = dataList;
      }
    }
  }

  async GetPaymentType() {
    let bodyData: IGetPaymentType = {
      TenantId: this.loginDetails.TenantId,
    };
    const categoryListService = this.paymentTypeService
      .GetPaymentType(bodyData)
      .subscribe((res: any) => {

        this.PaymentTypeList = res.PaymentTypeDetails;
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

        this.UserList = res.UserDetails;
      });
    this.subscriptions.push(categoryListService);
  }


  async getCategoryList() {
    try {
      const categoryBody: IGetCategory = {
        TenantId: this.loginDetails.TenantId
      };

      const res: any = await this.categoryService.getCategory(categoryBody)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.categoryList = res.CategoryDetails.filter((x: any) => x.CategoryName != 'Both');


    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }
  displayWithFn(value: string): string {
    return value || '';
  }

  async loadClientNames() {
    try {
      const bodyData: IGetTeaClient = {
        TenantId: this.loginDetails.TenantId,
        Category: ''

      };

      const res: any = await this.autocompleteService.GetClientNames(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.clientList = res.ClientDetails;


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
  getTransmitTotal(columnName: string): number {
    return this.dataSource.filteredData.filter(x => x.BillGenerated === true).reduce(
      (acc, curr) => acc + curr[columnName],
      0
    );
  }
  getNonTransmitTotal(columnName: string): number {
    return this.dataSource.filteredData.filter(x => x.BillGenerated != true).reduce(
      (acc, curr) => acc + curr[columnName],
      0
    );
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
      this.PaymentForm.controls['ClientId'].reset();
    }

    this.PaymentForm.controls['ClientId'].setValue(client?.ClientId);
  }

  search() {
    if (this.PaymentForm.invalid) {
      this.PaymentForm.markAllAsTouched();
      return;
    }
    this.GetPaymentData();


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
    //  this.PaymentForm.controls['toDate'].setValue(null);
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
