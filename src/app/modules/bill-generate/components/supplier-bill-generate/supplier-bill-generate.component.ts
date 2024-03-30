import { DatePipe, formatDate } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { _MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription, catchError, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { IGetTeaClient } from 'src/app/modules/collection/interfaces/istg';
import { AutoCompleteService } from 'src/app/modules/collection/services/auto-complete.service';
import { StgBillService } from '../../services/stg-bill.service';
import { IGetStgBill, SaveStgBill, StgCollectionData, StgPaymentData } from '../../interfaces/iget-stg-bill';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-supplier-bill-generate',
  templateUrl: './supplier-bill-generate.component.html',
  styleUrls: ['./supplier-bill-generate.component.scss']
})
export class SupplierBillGenerateComponent implements OnInit {

  displayedColumns: string[] = [
    'CollectionDate',
    'Factory',
    'VehicleNo',
    'FineLeaf',
    'ChallanWeight',
    'Rate',
    'Amount'

  ];

  paymentDisplayedColumns: string[] = [
    'PaymentDate',
    'EntryDate',
    'PaymentType',
    'Narration',
    'Amount'

  ];

  dataSource = new _MatTableDataSource<any>();
  paymentDataSource = new _MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    // { columnDef: 'CollectionDate', header: 'Collection Date' },
    // { columnDef: 'GradeName', header: 'Grade' },
    // { columnDef: 'Collection', header: 'Collection(KG)' },
    // { columnDef: 'Deduction', header: 'Deduction(KG)' },
    // { columnDef: 'Final', header: 'Final(KG)' },
    // { columnDef: 'Rate', header: 'Rate' },
    //  { columnDef: 'Amount', header: 'Amount' }

  ];
  paymentColumns: { columnDef: string; header: string }[] = [
    { columnDef: 'EntryDate', header: 'Entry Date' },
    { columnDef: 'PaymentType', header: 'Payment Type' },
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
  supplierBillForm!: FormGroup;
  supplierAmountForm!: FormGroup;
  minToDate!: any;
  currentDate: Date | null = new Date();
  ClientNames: any[] = [];
  OutStandingData: any[] = [];
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
    this.supplierBillForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required],
      ClientId: [0],
      ClientName: ['', Validators.required]
    });
    this.supplierAmountForm = this.fb.group({
      SeasonAmount: [0],
      PreviousAmount: [0],
      BillDate: [new Date()],
      LessComission: [0],
      Transporting: [0],
      GreenLeafCess: [0],
      FinalBillAmount: [0],
      LessSeasonAdv: [0],
      AmountToPay: [0]
    });

    await this.loadClientNames();
  }

  cleanAmountController(): void {
    const controlsToReset: string[] = [
      'FinalBillAmount',
      'LessSeasonAdv',
      'GreenLeafCess',
      'Transporting',
      'Incentive',
      'AmountToPay',
      'SeasonAmount',
      'PreviousAmount'
    ];

    controlsToReset.forEach(controlName => {
      this.supplierAmountForm.controls[controlName].reset();
    });
  }

  calculateFinalAmount(): void {
    const grossAmount: number = this.getTotal('GrossAmount');
    const finalWeight: number = this.getTotal('FinalWeight');
    const totalPayment: number = this.getTotalPayment('Amount');
    const totalPaymentWithPreviusBalance: number = totalPayment + Number(this.supplierAmountForm.controls['PreviousAmount'].value);
    const incentiveAmount: number = (this.supplierAmountForm.controls['Incentive'].value || 0) * finalWeight;
    const transportingAmount: number = (this.supplierAmountForm.controls['Transporting'].value || 0) * finalWeight;
    const cessAmount: number = (this.supplierAmountForm.controls['GreenLeafCess'].value || 0) * finalWeight;

    const finalAmount: number = grossAmount + incentiveAmount - (transportingAmount + cessAmount) - totalPaymentWithPreviusBalance;
    const amountToPay: number = finalAmount - (this.supplierAmountForm.controls['LessSeasonAdv'].value || 0);

    // Update the value of the final amount input field
    this.supplierAmountForm.controls['FinalBillAmount'].setValue(finalAmount.toFixed(2));
    this.supplierAmountForm.controls['AmountToPay'].setValue(amountToPay.toFixed(2));

    if (this.supplierAmountForm.controls['SeasonAmount'].value > 0) {
      finalAmount < 0 ? this.supplierAmountForm.controls['LessSeasonAdv'].disable({ onlySelf: true }) : this.supplierAmountForm.controls['LessSeasonAdv'].enable({ onlySelf: true });

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
        Category: 'SUPPLIER',

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
    if (!this.dataSource.filteredData || this.dataSource.filteredData.length === 0) {
      return 0;
    }

    const columnValues: number[] = this.dataSource.filteredData
      .map(item => Number(item[columnName]))
      .filter(value => !isNaN(value));

    return columnValues.reduce((acc, curr) => acc + curr, 0);
  }

  getTotalPayment(columnName: string): number {
    if (!this.paymentDataSource.filteredData || this.paymentDataSource.filteredData.length === 0) {
      return 0;
    }

    const columnValues: number[] = this.paymentDataSource.filteredData
      .map(item => Number(item[columnName]))
      .filter(value => !isNaN(value));

    return columnValues.reduce((acc, curr) => acc + curr, 0);
  }

  getRate(columnName: string): number {
    const filteredData = this.dataSource.filteredData;
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

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


  selectClient(client: any) {
    if (client == '') {
      this.supplierBillForm.controls['ClientId'].reset();
    }
    console.log(client.ClientId, 'Client');

    this.supplierBillForm.controls['ClientId'].setValue(client?.ClientId);
  }

  async search() {
    if (this.supplierBillForm.invalid) {
      this.supplierBillForm.markAllAsTouched();
      return;
    }

    this.cleanAmountController();
    await this.GetStgBillData();

  }

  async GetStgBillData() {
   
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
    this.selectedPaymentRowIndex = -1;
  }
  selectPaymentRow(row: any, index: number) {

    this.selectedPaymentRowIndex = index; // Set the selected row index
    this.selectedRowIndex = -1;
  }
  fromDateChange(event: MatDatepickerInputEvent<Date>): void {
    this.supplierBillForm.controls['toDate'].setValue(null);
    this.minToDate = event.value;
  }
  @HostListener('document:keydown', ['$event'])
  handleKeyboardNavigation(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      if (this.isDataSourceFocused() && this.selectedRowIndex < this.dataSource.data.length - 1) {
        this.selectedRowIndex++;
      }
      if (this.isPaymentDataSourceFocused() && this.selectedPaymentRowIndex < this.paymentDataSource.data.length - 1) {
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
  BillSave() {
    
  }

  async SaveBill(clientBody: SaveStgBill) {
    
  }

}
