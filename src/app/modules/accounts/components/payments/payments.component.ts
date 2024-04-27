import { DatePipe, formatDate } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { AddEditPaymentComponent } from '../../models/add-edit-payment/add-edit-payment.component';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { IGetTeaClient } from 'src/app/modules/collection/interfaces/istg';
import { _MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { HelperService } from 'src/app/core/services/helper.service';
import { AutoCompleteService } from 'src/app/modules/collection/services/auto-complete.service';
import { SeasonAdvanceService } from '../../services/season-advance.service';
import { StgApproveService } from 'src/app/modules/collectionApprove/services/stg-approve.service';
import { IGetCategory } from 'src/app/modules/masters/interfaces/ICategory';
import { CategoryService } from 'src/app/modules/masters/services/category.service';
import { MatOptionSelectionChange } from '@angular/material/core';
import { IGetPayment } from '../../interfaces/ipayment';
import { PaymentService } from '../../services/payment.service';
import { environment } from 'src/environments/environment';
import { PaymenttypeService } from 'src/app/modules/masters/services/paymenttype.service';
import { IGetPaymentType } from 'src/app/modules/masters/interfaces/ipayment-type';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit {

  displayedColumns: string[] = [
    'EntryDate',
    'PaymentDate',
    'PaySource',
    'ClientName',
    'PaymentType',
    'Amount',
    'Narration',
    'actions'

  ];

  dataSource = new _MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'EntryDate', header: 'Entry Date' },
    { columnDef: 'PaymentDate', header: 'Payment Date' },
    { columnDef: 'ClientName', header: 'Client Name' },
    { columnDef: 'PaySource', header: 'Pay Source' },
    { columnDef: 'PaymentType', header: 'Payment Type' },
    { columnDef: 'Narration', header: 'Narration' },
    //  { columnDef: 'Amount', header: 'Amount' }

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
  // saleTypeList: any[]=[];
  categoryList: any[] = [];
  PaymentTypeList: any[] = [];
  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private helper: HelperService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private autocompleteService: AutoCompleteService,
    private categoryService: CategoryService,
    private paymentService: PaymentService,
    private paymentTypeService: PaymenttypeService


  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.PaymentForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required],
      ClientId: [0],
      ClientName: [''],
      CategoryId: ['', Validators.required],
      CategoryName: ['']

    });

    //  await this.loadVehicleNumbers(formatDate(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd', 'en-US'));
    await this.loadClientNames();
    this.getCategoryList()
    this.GetPaymentType()

  }

  GetPaymentType() {
    let bodyData: IGetPaymentType = {
      TenantId: this.loginDetails.TenantId,
    };
    const categoryListService = this.paymentTypeService
      .GetPaymentType(bodyData)
      .subscribe((res: any) => {
        // console.log(res);
        this.PaymentTypeList = res.PaymentTypeDetails;
      });
    this.subscriptions.push(categoryListService);
  }

  GetPaymentData() {
    const currentDate = new Date();
    let bodyData: IGetPayment = {
      FromDate:  formatDate(this.PaymentForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
      ToDate:formatDate(this.PaymentForm.value.toDate, 'yyyy-MM-dd', 'en-US'),
      TenantId: this.loginDetails.TenantId,
      ClientCategory: this.PaymentForm.value.CategoryName,
      ClientId: this.PaymentForm.value.ClientId ?? 0,
      PaymentTypeId: 0,
      CreatedBy:0
    };
    console.log(bodyData, 'bodyData bodyData');

    const categoryListService = this.paymentService
      .GetPaymentData(bodyData)
      .subscribe((res: any) => {
        // console.log(res);
        this.dataSource.data = res.PaymentDetails;
      });
    this.subscriptions.push(categoryListService);
  }

  async selectCategory(event: MatOptionSelectionChange, category: any) {

    if (event.source.selected) {
      this.PaymentForm.controls['ClientId'].reset();
      this.PaymentForm.controls['ClientName'].reset();
      this.PaymentForm.controls['CategoryName'].setValue(category?.CategoryName);
      //   console.log(category.CategoryName, 'CategoryName');
      await this.loadClientNames();
    }

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
        Category: this.PaymentForm.value.CategoryName

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
  getTotal(columnName: string): number {
    return this.dataSource.filteredData.reduce(
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

    if (!environment.production) {
      console.log(client.ClientId, 'Client');
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
    this.PaymentForm.controls['toDate'].setValue(null);
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
    const dialogRef = this.dialog.open(AddEditPaymentComponent, {
      width: '30%',
      data: {
        title: 'Add Payment Entry',
        buttonName: 'Save',
      },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.GetPaymentData();

      }
    });
  }

  editItem(element: any) {
    const dialogRef = this.dialog.open(AddEditPaymentComponent, {
      width: '30%',
      data: {
        title: 'Update Payment Entry',
        buttonName: 'Update',
        value: element,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.GetPaymentData();

      }
    });
  }

}
