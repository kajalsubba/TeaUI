import { DatePipe, formatDate } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
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
import { IGetTeaClient } from 'src/app/modules/collection/interfaces/istg';
import { AutoCompleteService } from 'src/app/modules/collection/services/auto-complete.service';
import { IGetCategory } from 'src/app/modules/masters/interfaces/ICategory';
import { CategoryService } from 'src/app/modules/masters/services/category.service';
import { ISmartHistory } from '../../interfaces/istgbill-history';
import { SuppilerHistoryService } from '../../services/suppiler-history.service';

@Component({
  selector: 'app-smart-history',
  templateUrl: './smart-history.component.html',
  styleUrls: ['./smart-history.component.scss']
})
export class SmartHistoryComponent implements OnInit {

  leftDisplayedColumns: string[] = [
    'CollectionDate',
    'FinalWeight',
    'Rate',
    'Amount',
    'Status'

  ];

  rightDisplayedColumns: string[] = [
    'PaymentDate',
    'Narration',
    'Amount'

  ];

  LeafDataSource = new _MatTableDataSource<any>();
  PaymentDataSource = new _MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    // { columnDef: 'CollectionDate', header: 'Collection Date' },
  //  { columnDef: 'FinalWeight', header: 'Final Weight' },
    //  { columnDef: 'VehicleNo', header: 'Vehicle No ' },
    // { columnDef: 'Deduction', header: 'Deduction(KG)' },
    // { columnDef: 'Final', header: 'Final(KG)' },
    // { columnDef: 'Rate', header: 'Rate' },
    //  { columnDef: 'Amount', header: 'Amount' }

  ];
  paymentColumns: { columnDef: string; header: string }[] = [
    // { columnDef: 'EntryDate', header: 'Entry Date' },
    // { columnDef: 'PaymentType', header: 'Payment Type' },
    { columnDef: 'Narration', header: 'Narration' },
    //  { columnDef: 'Amount', header: 'Amount' }

  ];

  @ViewChild('ClientName') ClientNoInput!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();
  loginDetails: any;
  isSubmitting = false;
  smartHistoryForm!: FormGroup;
  CalculationForm!: FormGroup;
  minToDate!: any;
  currentDate: Date | null = new Date();
  ClientNames: any[] = [];
  clientList: any[] = [];
  OutStandingData: any[] = [];
  selectedRowIndex: number = -1;
  selectedPaymentRowIndex: number = -1;
  AverageRate:Number=0;
  categoryList: any[] = [];
  Totaldays:Number=0;
  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private helper: HelperService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private autocompleteService: AutoCompleteService,
    private categoryService: CategoryService,
    private smartService: SuppilerHistoryService
  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.smartHistoryForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required],
      ClientId: [0],
      CategoryId: [''],
      CategoryName: [''],
      ClientName: ['', Validators.required]
    });
    this.CalculationForm = this.fb.group({
      SeasonAmount: [0],
      PreviousAmount: [0],
    });
    await this.getCategoryList();
    await this.loadClientNames();
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

  convertDate(date: any): string {
    const parsedDate = new Date(date);
    return this.datePipe.transform(parsedDate, 'dd-MM-yyyy') || '';
  }


  displayWithFn(value: string): string {
    return value || '';
  }

  async loadClientNames() {
    try {
      const bodyData: IGetTeaClient = {
        TenantId: this.loginDetails.TenantId,
        Category: '',

      };

      const res: any = await this.autocompleteService.GetClientNames(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      // this.ClientNames = res.ClientDetails;
      this.clientList = res.ClientDetails;


    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }

  async selectCategory(event: MatOptionSelectionChange, category: any) {

    if (event.source.selected) {
      this.smartHistoryForm.controls['ClientId'].reset();
      this.smartHistoryForm.controls['ClientName'].reset();
      this.smartHistoryForm.controls['CategoryName'].setValue(category?.CategoryName);
      if (category == '') {
        this.ClientNames = this.clientList;
      }
      else {
        var dataList = this.clientList.filter((x: any) => x.CategoryName.toLowerCase() == this.smartHistoryForm.value.CategoryName.toLowerCase() || x.CategoryName.toLowerCase() == 'Both'.toLowerCase())
        this.ClientNames = dataList;
      }

    }

  }

  getTotal(columnName: string): number {
    if (!this.LeafDataSource.filteredData || this.LeafDataSource.filteredData.length === 0) {
      return 0;
    }

    // const columnValues: number[] = this.LeafDataSource.filteredData
    //   .map(item => Number(item[columnName]))
    //   .filter((x: any) => x.Status != 'Rejected');

    // return columnValues.reduce((acc, curr) => acc + curr, 0);

    return this.LeafDataSource.filteredData.filter((x: any) => x.Status != 'Rejected').reduce((acc, curr) => acc + curr[columnName], 0);

  }

  getTotalPayment(columnName: string): number {
    if (!this.PaymentDataSource.filteredData || this.PaymentDataSource.filteredData.length === 0) {
      return 0;
    }

    const columnValues: number[] = this.PaymentDataSource.filteredData
      .map(item => Number(item[columnName]))
      .filter(value => !isNaN(value));

    return columnValues.reduce((acc, curr) => acc + curr, 0);
  }

  getRate(columnName: string): number {
    const filteredData = this.LeafDataSource.filteredData;
    const total = filteredData.reduce(
      (acc, curr) => acc + curr[columnName],
      0
    );
    const count = filteredData.length;

    // Calculate average
    const average = count !== 0 ? total / count : 0;

    return average;
  }


  filterClientNames(value: string): any[] {

    const filterValue = value.toLowerCase();
    return this.ClientNames.filter((x: any) => x?.ClientName?.toLowerCase()?.includes(filterValue));
  }
  ngAfterViewInit() {

    this.LeafDataSource.paginator = this.paginator;
    this.LeafDataSource.sort = this.sort;
  }


  selectClient(client: any) {
    if (client == '') {
      this.smartHistoryForm.controls['ClientId'].reset();
    }
    console.log(client.ClientId, 'Client');

    this.smartHistoryForm.controls['ClientId'].setValue(client?.ClientId);
  }

  async search() {
    if (this.smartHistoryForm.invalid) {
      this.smartHistoryForm.markAllAsTouched();
      return;
    }
    await this.GetSmartSummary();
    const grossAmount: number = this.getTotal('Amount');
    const challanWeight: number = this.getTotal('FinalWeight');
    this.AverageRate=grossAmount/challanWeight;

    const uniqueCategories = new Set(this.LeafDataSource.data.map(leaf => leaf.CollectionDate));
    const distinctCount = uniqueCategories.size;
   this.Totaldays=distinctCount;
  }

  async GetSmartSummary() {
    try {
      const bodyData: ISmartHistory = {
        FromDate: formatDate(this.smartHistoryForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
        ToDate: formatDate(this.smartHistoryForm.value.toDate, 'yyyy-MM-dd', 'en-US'),
        ClientId: this.smartHistoryForm.value.ClientId ?? 0,
        TenantId: this.loginDetails.TenantId,
        CategoryName: this.smartHistoryForm.value.CategoryName ?? "",

      };
      const res: any = await this.smartService.GetSmartHistory(bodyData).toPromise();
      const { CollectionSummary, PaymentSummary, OutstandingSummary } = res;

      this.LeafDataSource.data = CollectionSummary;

      this.PaymentDataSource.data = PaymentSummary;
   
      if (OutstandingSummary && OutstandingSummary.length > 0) {
        const { SeasonAdvance, PreviousBalance } = OutstandingSummary[0];
      this.CalculationForm.controls['SeasonAmount'].setValue(SeasonAdvance.toFixed(2));
      this.CalculationForm.controls['PreviousAmount'].setValue(PreviousBalance.toFixed(2));
      }
      else
      {
        this.CalculationForm.controls['SeasonAmount'].setValue(0);
        this.CalculationForm.controls['PreviousAmount'].setValue(0);
      }

  
    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.LeafDataSource.filter = filterValue.trim().toLowerCase();

    if (this.LeafDataSource.paginator) {
      this.LeafDataSource.paginator.firstPage();
    }
  }
  selectRow(row: any, index: number) {

    this.selectedRowIndex = index; // Set the selected row index
    this.selectedPaymentRowIndex = -1;
  }
  selectPaymentRow(row: any, index: number) {

    this.selectedPaymentRowIndex = index; // Set the selected row index
    this.selectedRowIndex = -1;
  }
  fromDateChange(event: MatDatepickerInputEvent<Date>): void {
    this.smartHistoryForm.controls['toDate'].setValue(null);
    this.minToDate = event.value;
  }
  @HostListener('document:keydown', ['$event'])
  handleKeyboardNavigation(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      if (this.isDataSourceFocused() && this.selectedRowIndex < this.LeafDataSource.data.length - 1) {
        this.selectedRowIndex++;
      }
      if (this.isPaymentDataSourceFocused() && this.selectedPaymentRowIndex < this.PaymentDataSource.data.length - 1) {
        this.selectedPaymentRowIndex++;
      }
    } else if (event.key === 'ArrowUp') {
      if (this.isDataSourceFocused() && this.selectedRowIndex > 0) {
        this.selectedRowIndex--;
      }
      if (this.isPaymentDataSourceFocused() && this.selectedPaymentRowIndex > 0) {
        this.selectedPaymentRowIndex--;
      }
    }
  }

  isDataSourceFocused(): boolean {
    return this.selectedRowIndex !== -1;
  }

  isPaymentDataSourceFocused(): boolean {
    return this.selectedPaymentRowIndex !== -1;
  }

  editItem(e: any) {

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
