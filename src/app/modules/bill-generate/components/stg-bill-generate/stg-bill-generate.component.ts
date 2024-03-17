import { DatePipe } from '@angular/common';
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

@Component({
  selector: 'app-stg-bill-generate',
  templateUrl: './stg-bill-generate.component.html',
  styleUrls: ['./stg-bill-generate.component.scss']
})
export class StgBillGenerateComponent implements OnInit {

  displayedColumns: string[] = [
    'CollectionDate',
    'Grade',
    'Collection',
    'Deduction',
    'Final',
    'Rate',
    'Amount'

  ];
  dummyData = [
    { 
      CollectionDate: '2024-03-16',
      Grade: 'A',
      Collection: 100,
      Deduction: 10,
      Final: 90,
      Rate: 5,
      Amount: 450
    },
    { 
      CollectionDate: '2024-03-17',
      Grade: 'B',
      Collection: 120,
      Deduction: 12,
      Final: 108,
      Rate: 4,
      Amount: 432
    },
    // Add more dummy data as needed
  ];
  dummyPaymentData = [
    {
      PaymentDate: '2024-03-16',
      PaymentType: 'Cash',
      Narration: 'Payment for goods',
      Amount: 500
    },
    {
      PaymentDate: '2024-03-17',
      PaymentType: 'Credit Card',
      Narration: 'Online purchase',
      Amount: 250
    },
    // Add more dummy payment data as needed
  ];
  paymentDisplayedColumns: string[] = [
    'PaymentDate',
    'PaymentType',
    'Narration',
    'Amount'

  ];

  dataSource = new _MatTableDataSource<any>();
  paymentDataSource = new _MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    // { columnDef: 'CollectionDate', header: 'Collection Date' },
    { columnDef: 'Grade', header: 'Grade' },
    // { columnDef: 'Collection', header: 'Collection(KG)' },
    // { columnDef: 'Deduction', header: 'Deduction(KG)' },
    // { columnDef: 'Final', header: 'Final(KG)' },
    // { columnDef: 'Rate', header: 'Rate' },
    //  { columnDef: 'Amount', header: 'Amount' }

  ];
  paymentColumns: { columnDef: string; header: string }[] = [
    // { columnDef: 'PaymentDate', header: 'Payment Date' },
    { columnDef: 'PaymentType', header: 'Payment Type' },
    { columnDef: 'Narration', header: 'Narration' },
    //  { columnDef: 'Amount', header: 'Amount' }

  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();
  loginDetails: any;
  StgBillForm!: FormGroup;
  StgAmountForm!: FormGroup;
  minToDate!: any;
  currentDate: Date | null = new Date();
  ClientNames: any[] = [];
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
    private autocompleteService: AutoCompleteService
  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.StgBillForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required],
      ClientId: [0],
      ClientName: ['']
    });
    this.StgAmountForm = this.fb.group({
      SeasonAmount:[0],
      TransactDate:[new Date()],
      IncentiveAmount: [0],
      TransportingAmount: [0],
      CessAmount: [0],
      FinalAmount:[0]
    });
    this.dataSource.data = this.dummyData;
    this.paymentDataSource.data = this.dummyPaymentData;
    this.calculateFinalAmount()
    await this.loadClientNames();
  }

  calculateFinalAmount() {
    const totalAmount = this.getTotal('Amount');
    const incentiveAmount = this.StgAmountForm.controls['IncentiveAmount'].value || 0;
    const transportingAmount = this.StgAmountForm.controls['TransportingAmount'].value || 0;
    const cessAmount = this.StgAmountForm.controls['CessAmount'].value || 0;

    const finalAmount = totalAmount + incentiveAmount - (transportingAmount + cessAmount);
    
    // Update the value of the final amount input field
    this.StgAmountForm.controls['FinalAmount'].setValue(finalAmount.toFixed(2));
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
        Category: 'STG',

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
      this.StgBillForm.controls['ClientId'].reset();
    }
    console.log(client.ClientId, 'Client');

    this.StgBillForm.controls['ClientId'].setValue(client?.ClientId);
  }

  search() {

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
    this.StgBillForm.controls['toDate'].setValue(null);
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

}
