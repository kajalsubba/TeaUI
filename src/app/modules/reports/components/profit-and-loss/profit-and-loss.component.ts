import { DatePipe } from '@angular/common';
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
import { AutoCompleteService } from 'src/app/modules/collection/services/auto-complete.service';

@Component({
  selector: 'app-profit-and-loss',
  templateUrl: './profit-and-loss.component.html',
  styleUrls: ['./profit-and-loss.component.scss']
})
export class ProfitAndLossComponent implements OnInit {
  // !For STG 
  stgPurchaseDisplayedColumns: string[] = [
    'FinalWeight',
    'Amount',
    'Rate',
    'IncAmount',
    'Transporting',
    'CessAmount',
    'PayAmount',
  ];

  stgSaleDisplayedColumns: string[] = [
    'Sale',
    'Amount',
    'Rate',
    'IncAmount',
    'FinalAmount'

  ];

  stgPurchaseDataSource = new _MatTableDataSource<any>();
  stgSaleDataSource = new _MatTableDataSource<any>();
  filteredData: any[] = [];
  stgPurchaseColumns: { columnDef: string; header: string }[] = [];
  stgSaleColumns: { columnDef: string; header: string }[] = [];

  // !For SUPPLIER

  supplierPurchaseDisplayedColumns: string[] = [
    'FinalWeight',
    'Amount',
    'Rate',
    'Commission',
    'CessAmount',
    'PayAmount',

  ];

  supplierSaleDisplayedColumns: string[] = [
    'Sale',
    'Amount',
    'Rate',
    'IncAmount',
    'FinalAmount'
  ];

  supplierPurchaseDataSource = new _MatTableDataSource<any>();
  supplierSaleDataSource = new _MatTableDataSource<any>();
  supplierPurchaseColumns: { columnDef: string; header: string }[] = [
    // { columnDef: 'CollectionDate', header: 'Collection Date' },
    { columnDef: 'GradeName', header: 'Grade' },
    // { columnDef: 'Collection', header: 'Collection(KG)' },
    // { columnDef: 'Deduction', header: 'Deduction(KG)' },
    // { columnDef: 'Final', header: 'Final(KG)' },
    // { columnDef: 'Rate', header: 'Rate' },
    //  { columnDef: 'Amount', header: 'Amount' }

  ];
  supplierSaleColumns: { columnDef: string; header: string }[] = [
    { columnDef: 'EntryDate', header: 'Entry Date' },
    { columnDef: 'PaymentType', header: 'Payment Type' },
    { columnDef: 'Narration', header: 'Narration' },
    //  { columnDef: 'Amount', header: 'Amount' }

  ];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();
  loginDetails: any;
  isSubmitting = false;
  profitLossForm!: FormGroup;
  StgProfitLossForm!: FormGroup;
  SupplierProfitLossForm!: FormGroup;
  minToDate!: any;
  currentDate: Date | null = new Date();
  selectedRowIndex: number = -1;
  selectedPaymentRowIndex: number = -1;
  // saleTypeList: any[]=[];
  categoryList: any[] = [];
  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private helper: HelperService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private autocompleteService: AutoCompleteService,
  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.profitLossForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required]
    });

    this.StgProfitLossForm = this.fb.group({
      GainLoss: ['', Validators.required],
      AccesessLeaf: ['', Validators.required],
      PerKg: ['', Validators.required]
    });
    this.SupplierProfitLossForm = this.fb.group({
      GainLoss: ['', Validators.required],
      AccesessLeaf: ['', Validators.required],
      PerKg: ['', Validators.required]
    });
  }
  convertDate(date: any): string {
    const parsedDate = new Date(date);
    return this.datePipe.transform(parsedDate, 'dd-MM-yyyy') || '';
  }


  displayWithFn(value: string): string {
    return value || '';
  }
 
  ngAfterViewInit() {

    this.stgPurchaseDataSource.paginator = this.paginator;
    this.stgPurchaseDataSource.sort = this.sort;
  }



  async search() {
    if (this.profitLossForm.invalid) {
      this.profitLossForm.markAllAsTouched();
      return;
    }

  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.stgPurchaseDataSource.filter = filterValue.trim().toLowerCase();

    if (this.stgPurchaseDataSource.paginator) {
      this.stgPurchaseDataSource.paginator.firstPage();
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
    this.profitLossForm.controls['toDate'].setValue(null);
    this.minToDate = event.value;
  }
  @HostListener('document:keydown', ['$event'])
  handleKeyboardNavigation(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      if (this.isDataSourceFocused() && this.selectedRowIndex < this.stgPurchaseDataSource.data.length - 1) {
        this.selectedRowIndex++;
      }
      if (this.isPaymentDataSourceFocused() && this.selectedPaymentRowIndex < this.stgSaleDataSource.data.length - 1) {
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
