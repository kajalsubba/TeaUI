import { DatePipe, formatDate } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { _MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { ReplaySubject, Subject, Subscription, catchError, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { IGetTeaClient } from 'src/app/modules/collection/interfaces/istg';
import { AutoCompleteService } from 'src/app/modules/collection/services/auto-complete.service';
import { StgBillService } from '../../services/stg-bill.service';
import { IClient, IGetStgBill, SaveStgBill, StgCollectionData, StgPaymentData } from '../../interfaces/iget-stg-bill';
import { environment } from 'src/environments/environment';
import { SupplierBillService } from '../../services/supplier-bill.service';
import { SaveSupplierBill } from '../../interfaces/iget-supplier-bill';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { MatSelect } from '@angular/material/select';
import { RateUnFixComponent } from '../../model/rate-un-fix/rate-un-fix.component';

@Component({
  selector: 'app-supplier-bill-generate',
  templateUrl: './supplier-bill-generate.component.html',
  styleUrls: ['./supplier-bill-generate.component.scss']
})
export class SupplierBillGenerateComponent implements OnInit {

  displayedColumns: string[] = [
    'CollectionDate',
    'FactoryName',
    'VehicleNo',
    'FineLeaf',
    'ChallanWeight',
    'Rate',
    'GrossAmount'

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

    { columnDef: 'FactoryName', header: 'Factory Name' },
    { columnDef: 'VehicleNo', header: 'Vehicle No ' },

  ];
  paymentColumns: { columnDef: string; header: string }[] = [
    { columnDef: 'EntryDate', header: 'Entry Date' },
    { columnDef: 'PaymentType', header: 'Payment Type' },
    { columnDef: 'Narration', header: 'Narration' },

  ];

  @ViewChild('ClientName') ClientNoInput!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('singleSelect', { static: true }) singleSelect!: MatSelect;
  public filteredClients: ReplaySubject<IClient[]> = new ReplaySubject<IClient[]>(1);

  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();
  loginDetails: any;
  isSubmitting = false;
  supplierBillForm!: FormGroup;
  supplierAmountForm!: FormGroup;
  minToDate!: any;
  currentDate: Date | null = new Date();
  ClientNames: IClient[] = [];
  OutStandingData: any[] = [];
  selectedRowIndex: number = -1;
  selectedPaymentRowIndex: number = -1;
  AverageRate: number = 1;
  isLockEnabled: boolean = true;

  categoryList: any[] = [];
  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private helper: HelperService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private autocompleteService: AutoCompleteService,
    private billService: SupplierBillService
  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.supplierBillForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required],
      ClientId: [0],
      ClientName: ['', Validators.required],
      ClienFilterCrtl: ['']
    });
    this.supplierAmountForm = this.fb.group({
      SeasonAmount: [0],
      PreviousAmount: [0],
      BillDate: [new Date()],
      LessComission: [0],
      GreenLeafCess: [0],
      FinalBillAmount: [0],
      LessSeasonAdv: [0],
      AmountToPay: [0]
    });

    await this.loadClientNames();
    this.filteredClients.next(this.ClientNames.slice());

    // // listen for search field value changes
    this.supplierBillForm.controls["ClienFilterCrtl"].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.filteredClientsData();
      });
  }
  private filteredClientsData() {
    // debugger
    if (!this.ClientNames) {
      return;
    }
    // get the search keyword
    let search = this.supplierBillForm.controls["ClienFilterCrtl"].value;
    if (!search) {
      this.filteredClients.next(this.ClientNames.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredClients.next(
      this.ClientNames.filter(x => x.ClientName.toLowerCase().indexOf(search) > -1)
    );
  }


  async onLockToggle(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;

    // Do something based on the state
    if (checked) {
      this.isLockEnabled = true;
      // Checkbox is checked
    } else {
      this.isLockEnabled = false;
    }

  }
  cleanAmountController(): void {
    const controlsToReset: string[] = [
      'FinalBillAmount',
      'LessSeasonAdv',
      'GreenLeafCess',
      'LessComission',
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
    const finalWeight: number = this.getTotal('ChallanWeight');
    const totalPayment: number = this.getTotalPayment('Amount');
    const totalPaymentWithPreviusBalance: number = totalPayment + Number(this.supplierAmountForm.controls['PreviousAmount'].value);
    const lessCommAmount: number = (this.supplierAmountForm.controls['LessComission'].value || 0) * finalWeight;
    const cessAmount: number = (this.supplierAmountForm.controls['GreenLeafCess'].value || 0) * finalWeight;

    const finalAmount: number = grossAmount - lessCommAmount - cessAmount - totalPaymentWithPreviusBalance;
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

  openUnFixSupplierData(row: any) {
    const dialogRef = this.dialog.open(RateUnFixComponent, {
      width: '60vw',
      minWidth: '70vw',
      disableClose: true,
      data: {
        title: 'Un-Fix Rate Data (Supplier)',
        unfixData: row,
        isEdit: true,
        fromDate: formatDate(this.supplierBillForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
        toDate: formatDate(this.supplierBillForm.value.toDate, 'yyyy-MM-dd', 'en-US'),
        clientId: this.supplierBillForm.value.ClientName?.ClientId ?? 0,
        Category: 'Supplier',
        clientName: this.supplierBillForm.value.ClientName.ClientName
      },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
      }
    });
  }

  selectClient(client: any) {
    if (client == '') {
      this.supplierBillForm.controls['ClientId'].reset();
    }

    this.supplierBillForm.controls['ClientId'].setValue(client?.ClientId);
  }

  async search() {
    if (this.supplierBillForm.invalid) {
      this.supplierBillForm.markAllAsTouched();
      return;
    }

    this.cleanAmountController();
    await this.GetSupplierBillData();

  }

  async GetSupplierBillData() {
    try {
      const bodyData: IGetStgBill = {
        FromDate: formatDate(this.supplierBillForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
        ToDate: formatDate(this.supplierBillForm.value.toDate, 'yyyy-MM-dd', 'en-US'),
        TenantId: this.loginDetails.TenantId,
        ClientId: this.supplierBillForm.value.ClientName?.ClientId ?? 0
      };

      const res: any = await this.billService.GetSupplierBill(bodyData).toPromise();
      const { SupplierData, PaymentData, OutStandingData, SupplierDataWithoutRate } = res;

      this.dataSource.data = SupplierData;
      this.paymentDataSource.data = PaymentData;

      const grossAmount: number = this.getTotal('GrossAmount');
      const challanWeight: number = this.getTotal('ChallanWeight');
      this.AverageRate = grossAmount / challanWeight;

      if (OutStandingData && OutStandingData.length > 0) {
        const { SeasonAdvance, PreviousBalance } = OutStandingData[0];
        this.supplierAmountForm.controls['SeasonAmount'].setValue(SeasonAdvance.toFixed(2));
        this.supplierAmountForm.controls['PreviousAmount'].setValue(PreviousBalance.toFixed(2));
        this.supplierAmountForm.controls['LessSeasonAdv'].enable({ onlySelf: true });
      }
      else {
        //this.toastr.warning('Please submit fisrt season advace!', 'Notification')
        this.supplierAmountForm.controls['SeasonAmount'].setValue(0);
        this.supplierAmountForm.controls['PreviousAmount'].setValue(0);
        this.supplierAmountForm.controls['LessSeasonAdv'].disable({ onlySelf: true });


      }

      if (Number(this.supplierAmountForm.controls['SeasonAmount'].value) <= 0) {
        this.supplierAmountForm.controls['LessSeasonAdv'].disable({ onlySelf: true });

      }

      if (SupplierDataWithoutRate.length > 0) {
        this.isSubmitting = true;
        this.openUnFixSupplierData(SupplierDataWithoutRate);
      }
      else {
        this.isSubmitting = false;
      }

    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
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
    //   this.supplierBillForm.controls['toDate'].setValue(null);
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

    if (this.dataSource.data.length == 0) {

      this.toastr.error('Collection has no data!', 'Error')
      return
    }

    if (this.supplierAmountForm.value.LessComission == null || this.supplierAmountForm.value.GreenLeafCess == null

    ) {

      this.toastr.error('Bill Calculate Amount should not be blank.!', 'Error')
      return
    }

    if (this.supplierAmountForm.invalid || this.supplierAmountForm.value.ClientId == 0 || this.supplierBillForm.invalid) {
      this.supplierAmountForm.markAllAsTouched();
      this.supplierBillForm.markAllAsTouched();
      return;
    }
    const StgObject: StgCollectionData[] = [];
    const PaymentObject: StgPaymentData[] = [];
    this.dataSource.data.forEach((selectedItem) => {
      const selectedObject: StgCollectionData = {
        CollectionId: selectedItem.CollectionId ?? 0, // Assuming CollectionId is present in your data
      };
      StgObject.push(selectedObject);
    });

    this.paymentDataSource.data.forEach((selectedItem) => {
      const selectedObject: StgPaymentData = {
        PaymentId: selectedItem.PaymentId ?? 0, // Assuming CollectionId is present in your data
      };
      PaymentObject.push(selectedObject);
    });

    let data: SaveSupplierBill = {

      BillDate: formatDate(this.supplierAmountForm.value.BillDate, 'yyyy-MM-dd', 'en-US'),
      FromDate: formatDate(this.supplierBillForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
      ToDate: formatDate(this.supplierBillForm.value.toDate, 'yyyy-MM-dd', 'en-US'),
      ClientId: this.supplierBillForm.value.ClientName?.ClientId,// this.supplierBillForm.value.ClientId,
      FinalWeight: this.getTotal('ChallanWeight') ?? 0,
      TotalStgAmount: this.getTotal('GrossAmount') ?? 0,
      TotalStgPayment: this.getTotalPayment('Amount') ?? 0,
      PreviousBalance: this.supplierAmountForm.value.PreviousAmount ?? 0,
      StandingSeasonAdv: this.supplierAmountForm.value.SeasonAmount ?? 0,
      Commision: this.supplierAmountForm.value.LessComission ?? 0,
      GreenLeafCess: this.supplierAmountForm.value.GreenLeafCess ?? 0,
      FinalBillAmount: this.supplierAmountForm.value.FinalBillAmount ?? 0,
      LessSeasonAdv: this.supplierAmountForm.value.LessSeasonAdv ?? 0,
      AmountToPay: this.supplierAmountForm.value.AmountToPay ?? 0,
      TenantId: this.loginDetails.TenantId,
      CreatedBy: this.loginDetails.UserId,
      CollectionData: StgObject,
      PaymentData: PaymentObject
    };

    if (!environment.production) {
      console.log(data, 'bildata');
    }
    this.isSubmitting = true;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '30vw',
      minWidth: '25vw',
      disableClose: true,
      data: {
        title: 'Confirm Action',
        message: 'Do you want to Confirm !',
        data: data,

      },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.SaveBill(data);
      }
      else {
        this.isSubmitting = false
          ;

      }
    });

  }

  async SaveBill(clientBody: SaveSupplierBill) {
    this.billService.SaveSupplierBill(clientBody)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error:', error);
          this.isSubmitting = false;
          this.toastr.error('An error occurred', 'ERROR');
          throw error;
        })
      )
      .subscribe((res: any) => {

        this.toastr.success(res.Message, 'SUCCESS');


        const formControls = [
          'ClientName',
          'ClientId',

        ];

        formControls.forEach(control => {
          this.supplierBillForm.controls[control].reset();
        });
      });

    // await this.GetSupplierBillData();
    this.dataSource.data = [];
    this.paymentDataSource.data = [];
    this.cleanAmountController();

    // this.ClientNoInput.nativeElement.focus();
    this.isSubmitting = false;
  }

}
