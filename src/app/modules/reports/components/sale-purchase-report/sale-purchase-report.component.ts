import { CurrencyPipe, DatePipe, formatDate, registerLocaleData } from '@angular/common';
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
import { IReports } from '../../interfaces/ireports';
import { ReportsServiceService } from '../../services/reports-service.service';
import enIN from '@angular/common/locales/en-IN';
registerLocaleData(enIN);
@Component({
  selector: 'app-sale-purchase-report',
  templateUrl: './sale-purchase-report.component.html',
  styleUrls: ['./sale-purchase-report.component.scss']
})
export class SalePurchaseReportComponent implements OnInit {
  // !For STG 
  stgPurchaseDisplayedColumns: string[] = [
    'StgTotalKg',
    'Amount',
    'AvgRate',
    'IncAmount',
    'CessAmount',
    'TransportingAmount'

  ];

  stgPurchaseDataSource = new _MatTableDataSource<any>();
  stgPurchaseColumns: { columnDef: string; header: string }[] = [

    { columnDef: 'StgTotalKg', header: 'Total Kg' },
    { columnDef: 'Amount', header: 'Amount' },
    { columnDef: 'AvgRate', header: 'Avg. Rate' },
    { columnDef: 'IncAmount', header: 'Inc. Amount' },
    { columnDef: 'CessAmount', header: 'GL Cess. Amount' },
    { columnDef: 'TransportingAmount', header: 'Trans. Amount' },
  ];

  stgSaleDisplayedColumns: string[] = [
    'TotalSaleKg',
    'SaleAmount',
    'IncAmount',
    'AvgRate'

  ];
  stgSaleDataSource = new _MatTableDataSource<any>();
  stgSaleColumns: { columnDef: string; header: string }[] = [

    { columnDef: 'TotalSaleKg', header: 'Total Kg' },
    { columnDef: 'SaleAmount', header: 'Sale Amount' },
    { columnDef: 'IncAmount', header: 'Inc. Amount' },
    { columnDef: 'AvgRate', header: 'Avg. Rate' },
  ];




  filteredData: any[] = [];


  // !For SUPPLIER

  supplierPurchaseDisplayedColumns: string[] = [
    'SupplierTotalKg',
    'Amount',
    'AvgRate',
    'CommissionAmount',
    'CessAmount',


  ];
  supplierPurchaseDataSource = new _MatTableDataSource<any>();
  supplierPurchaseColumns: { columnDef: string; header: string }[] = [
    { columnDef: 'SupplierTotalKg', header: 'Total Kg' },
    { columnDef: 'Amount', header: 'Amount' },
    { columnDef: 'AvgRate', header: 'Avg. Rate' },
    { columnDef: 'CommissionAmount', header: 'Comm. Amount' },
    { columnDef: 'CessAmount', header: 'GL Cess. Amount' },

  ];

  supplierSaleDisplayedColumns: string[] = [
    'TotalSaleKg',
    'SaleAmount',
    'IncAmount',
    'AvgRate'
  ];


  supplierSaleDataSource = new _MatTableDataSource<any>();
  supplierSaleColumns: { columnDef: string; header: string }[] = [
    { columnDef: 'TotalSaleKg', header: 'Total Kg' },
    { columnDef: 'SaleAmount', header: 'Sale Amount' },
    { columnDef: 'IncAmount', header: 'Inc. Amount' },
    { columnDef: 'AvgRate', header: 'Avg. Rate' }

  ];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();
  loginDetails: any;
  isSubmitting = false;
  SalePurchaseForm!: FormGroup;
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
    private reportService: ReportsServiceService,
    private autocompleteService: AutoCompleteService,
    private currencyPipe: CurrencyPipe
  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.SalePurchaseForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required]
    });

    this.StgProfitLossForm = this.fb.group({
      LossProfit: [''],
      LeafBalancing: [''],
      FinalPartyPayment: [''],
      FinalSaleAmount: [''],
    });
    this.SupplierProfitLossForm = this.fb.group({
      FinalPartyPayment:[''],
      SupplierFinalSaleAmount: [''],
      SupplierLossProfit: [''],
      SupplierLeafBalancing: ['']
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
    if (this.SalePurchaseForm.invalid) {
      this.SalePurchaseForm.markAllAsTouched();
      return;
    }

    const currentDate = new Date();
    let bodyData: IReports = {
      FromDate: formatDate(this.SalePurchaseForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
      ToDate: formatDate(this.SalePurchaseForm.value.toDate, 'yyyy-MM-dd', 'en-US'),
      TenantId: this.loginDetails.TenantId,
    };
    console.log(bodyData, 'bodyData bodyData');

    const categoryListService = this.reportService
      .GetPurchaseSaleReport(bodyData)
      .subscribe((res: any) => {
        // console.log(res);
        this.stgPurchaseDataSource.data = res.StgPurchase;
        this.stgSaleDataSource.data = res.StgSale;
        this.supplierPurchaseDataSource.data = res.SupplierPurchase;
        this.supplierSaleDataSource.data = res.SupplierSale;
        const FinalPayment = res.StgPurchase[0].Amount + res.StgPurchase[0].IncAmount - res.StgPurchase[0].CessAmount - res.StgPurchase[0].TransportingAmount;
        const leafBalance = res.StgSale[0].TotalSaleKg - res.StgPurchase[0].StgTotalKg;
        const FinalSaleAmount=res.StgSale[0].SaleAmount+res.StgSale[0].IncAmount;
        const ProfitLoss=FinalSaleAmount-FinalPayment;

        const formattedFinalPayment =  this.currencyPipe.transform(Math.round(FinalPayment), "INR",
        '',
        undefined,
        "en-IN");

        const formattedFinalSaleAmount =  this.currencyPipe.transform(Math.round(FinalSaleAmount), "INR",
        '',
        undefined,
        "en-IN");

        const formattedLossProfit =  this.currencyPipe.transform(Math.round(ProfitLoss), "INR",
        '',
        undefined,
        "en-IN");
        
        this.StgProfitLossForm.controls['FinalPartyPayment'].setValue(formattedFinalPayment)
        this.StgProfitLossForm.controls['LeafBalancing'].setValue(leafBalance)
        this.StgProfitLossForm.controls['LossProfit'].setValue(formattedLossProfit)
        this.StgProfitLossForm.controls['FinalSaleAmount'].setValue(formattedFinalSaleAmount)


        const SupplierFinalPartyPayment= res.SupplierPurchase[0].Amount  - res.SupplierPurchase[0].CommissionAmount - res.SupplierPurchase[0].CessAmount;
     
        const SupplierleafBalance = res.SupplierSale[0].TotalSaleKg - res.SupplierPurchase[0].SupplierTotalKg;
        const SupplierFinalSaleAmount=res.SupplierSale[0].SaleAmount+res.SupplierSale[0].IncAmount;
        const SupplierProfitLoss=SupplierFinalSaleAmount-SupplierFinalPartyPayment;

        const formattedSupplierFinalPartyPayment =  this.currencyPipe.transform(Math.round(SupplierFinalPartyPayment), "INR",
        '',
        undefined,
        "en-IN");

        const formattedSupplierFinalSaleAmount =  this.currencyPipe.transform(Math.round(SupplierFinalSaleAmount), "INR",
        '',
        undefined,
        "en-IN");

        const formattedSupplierProfitLoss =  this.currencyPipe.transform(Math.round(SupplierProfitLoss), "INR",
        '',
        undefined,
        "en-IN");
        
        this.SupplierProfitLossForm.controls['FinalPartyPayment'].setValue(formattedSupplierFinalPartyPayment);
        this.SupplierProfitLossForm.controls['SupplierLeafBalancing'].setValue(SupplierleafBalance);
        this.SupplierProfitLossForm.controls['SupplierFinalSaleAmount'].setValue(formattedSupplierFinalSaleAmount);
        this.SupplierProfitLossForm.controls['SupplierLossProfit'].setValue(formattedSupplierProfitLoss);


      });
    this.subscriptions.push(categoryListService);

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
    // this.profitLossForm.controls['toDate'].setValue(null);
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
