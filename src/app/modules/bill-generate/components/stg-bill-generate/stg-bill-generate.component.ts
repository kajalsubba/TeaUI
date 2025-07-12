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
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-stg-bill-generate',
  templateUrl: './stg-bill-generate.component.html',
  styleUrls: ['./stg-bill-generate.component.scss']
})
export class StgBillGenerateComponent implements OnInit {

  displayedColumns: string[] = [
    'CollectionDate',
    //  'GradeName',
    'FirstWeight',
    'Deduction',
    'FinalWeight',
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
    { columnDef: 'GradeName', header: 'Grade' },

  ];
  paymentColumns: { columnDef: string; header: string }[] = [
    { columnDef: 'EntryDate', header: 'Entry Date' },
    { columnDef: 'PaymentType', header: 'Payment Type' },
    { columnDef: 'Narration', header: 'Narration' },

  ];

  @ViewChild('singleSelect', { static: true }) singleSelect!: MatSelect;
  public filteredClients: ReplaySubject<IClient[]> = new ReplaySubject<IClient[]>(1);


  @ViewChild('ClientName') ClientNoInput!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();
  loginDetails: any;
  isSubmitting = false;
  StgBillForm!: FormGroup;
  StgAmountForm!: FormGroup;
  PaidAmountErrorMsg: string = '';
  PaidAmountValidate: boolean = false;
  SeasonAdvValidate: boolean = false;
  SeasonAdvValidateMsg: string = '';
  minToDate!: any;
  currentDate: Date | null = new Date();
  ClientNames: IClient[] = [];
  OutStandingData: any[] = [];
  selectedRowIndex: number = -1;
  selectedPaymentRowIndex: number = -1;
  AverageRate: number = 0;
  // saleTypeList: any[]=[];
  categoryList: any[] = [];
  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private helper: HelperService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private autocompleteService: AutoCompleteService,
    private stgBillService: StgBillService
  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.StgBillForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required],
      ClientId: [0],
      ClientName: ['', Validators.required],
      ClienFilterCrtl: ['']
    });
    this.StgAmountForm = this.fb.group({
      SeasonAmount: [0],
      PreviousAmount: [0],
      PreOutstandingAmount: [0],
      BillDate: [new Date()],
      Incentive: [0],
      Transporting: [0],
      GreenLeafCess: [0],
      FinalBillAmount: [0],
      LessSeasonAdv: [0],
      AmountToPay: [0],
      PaidAmount: [0],
      OutstandingAmount: [0],

    });

    await this.loadClientNames();

    // load the initial bank list
    this.filteredClients.next(this.ClientNames.slice());

    // // listen for search field value changes
    this.StgBillForm.controls["ClienFilterCrtl"].valueChanges
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
    let search = this.StgBillForm.controls["ClienFilterCrtl"].value;
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


  cleanAmountController(): void {
    const controlsToReset: string[] = [
      'FinalBillAmount',
      'LessSeasonAdv',
      'GreenLeafCess',
      'Transporting',
      'Incentive',
      'AmountToPay',
      'SeasonAmount',
      'PreviousAmount',
      'PaidAmount',
      'OutstandingAmount'
    ];

    controlsToReset.forEach(controlName => {
      this.StgAmountForm.controls[controlName].reset();
    });
  }

  calculateFinalAmount(): void {
    //debugger
    const grossAmount: number = this.getTotal('GrossAmount');
    const finalWeight: number = this.getTotal('FinalWeight');
    const totalPayment: number = this.getTotalPayment('Amount');

    const totalPaymentWithPreviusBalance: number = totalPayment - Number(this.StgAmountForm.controls['PreviousAmount'].value);
    const incentiveAmount: number = (this.StgAmountForm.controls['Incentive'].value || 0) * finalWeight;
    const transportingAmount: number = (this.StgAmountForm.controls['Transporting'].value || 0) * finalWeight;
    const cessAmount: number = (this.StgAmountForm.controls['GreenLeafCess'].value || 0) * finalWeight;

    const finalAmount: number = grossAmount + incentiveAmount - transportingAmount - cessAmount - totalPaymentWithPreviusBalance;
    const amountToPay: number = finalAmount - (this.StgAmountForm.controls['LessSeasonAdv'].value || 0);

    amountToPay > 0 ? this.StgAmountForm.controls['PaidAmount'].setValue(amountToPay.toFixed(2)) : this.StgAmountForm.controls['PaidAmount'].setValue(0);

    const outStnadingAmount: number = amountToPay - (this.StgAmountForm.controls['PaidAmount'].value || 0);

    // Update the value of the final amount input field
    this.StgAmountForm.controls['FinalBillAmount'].setValue(finalAmount.toFixed(2));
    this.StgAmountForm.controls['AmountToPay'].setValue(amountToPay.toFixed(2));
    this.StgAmountForm.controls['OutstandingAmount'].setValue(outStnadingAmount.toFixed(2));
    debugger
    if (this.StgAmountForm.controls['SeasonAmount'].value > 0) {
      finalAmount < 0 ? this.StgAmountForm.controls['LessSeasonAdv'].disable({ onlySelf: true }) : this.StgAmountForm.controls['LessSeasonAdv'].enable({ onlySelf: true });

    }

    amountToPay <= 0 ? this.StgAmountForm.controls['PaidAmount'].disable({ onlySelf: true }) : this.StgAmountForm.controls['PaidAmount'].enable({ onlySelf: true });


  }

  calculateOutstandingAmount(): void {
    const outStnadingAmount: number = this.StgAmountForm.controls['AmountToPay'].value - (this.StgAmountForm.controls['PaidAmount'].value || 0);
    this.StgAmountForm.controls['OutstandingAmount'].setValue(outStnadingAmount.toFixed(2));

  }
  convertDate(date: any): string {
    const parsedDate = new Date(date);
    return this.datePipe.transform(parsedDate, 'dd-MM-yyyy') || '';
  }


  displayWithFn(value: string): string {
    return value || '';
  }

  async loadClientNames() {
    // debugger
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
      this.StgBillForm.controls['ClientId'].reset();
    }

    this.StgBillForm.controls['ClientId'].setValue(client?.ClientId);
  }

  async search() {
    if (this.StgBillForm.invalid) {
      this.StgBillForm.markAllAsTouched();
      return;
    }

    this.cleanAmountController();
    await this.GetStgBillData();

  }

  async GetStgBillData() {
    // debugger
    try {
      const bodyData: IGetStgBill = {
        FromDate: formatDate(this.StgBillForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
        ToDate: formatDate(this.StgBillForm.value.toDate, 'yyyy-MM-dd', 'en-US'),
        TenantId: this.loginDetails.TenantId,
        ClientId: this.StgBillForm.value.ClientName?.ClientId ?? 0
      };

      const res: any = await this.stgBillService.GetStgBill(bodyData).toPromise();
      const { StgData, PaymentData, OutStandingData } = res;

      this.dataSource.data = StgData;
      this.paymentDataSource.data = PaymentData;
      const grossAmount: number = this.getTotal('GrossAmount');
      const challanWeight: number = this.getTotal('FinalWeight');
      this.AverageRate = grossAmount / challanWeight;

      if (OutStandingData && OutStandingData.length > 0) {
        const { SeasonAdvance, PreviousBalance, OutStandingAmount } = OutStandingData[0];
        this.StgAmountForm.controls['SeasonAmount'].setValue(SeasonAdvance.toFixed(2));
        this.StgAmountForm.controls['PreviousAmount'].setValue(PreviousBalance.toFixed(2));
        //  this.StgAmountForm.controls['PreOutstandingAmount'].setValue(OutStandingAmount.toFixed(2));
        this.StgAmountForm.controls['LessSeasonAdv'].enable({ onlySelf: true });
      }
      else {
        //this.toastr.warning('Please submit fisrt season advace!', 'Notification')
        this.StgAmountForm.controls['SeasonAmount'].setValue(0);
        this.StgAmountForm.controls['PreviousAmount'].setValue(0);
        //    this.StgAmountForm.controls['PreOutstandingAmount'].setValue(0);
        this.StgAmountForm.controls['LessSeasonAdv'].disable({ onlySelf: true });


      }

      if (Number(this.StgAmountForm.controls['SeasonAmount'].value) <= 0) {
        this.StgAmountForm.controls['LessSeasonAdv'].disable({ onlySelf: true });

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
    // this.StgBillForm.controls['toDate'].setValue(null);
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

    debugger
    if (this.dataSource.data.length == 0) {

      this.toastr.error('Collection has no data!', 'Error')
      return
    }

    if (this.StgAmountForm.value.Incentive == null || this.StgAmountForm.value.Transporting == null ||
      this.StgAmountForm.value.GreenLeafCess == null ||
      this.StgAmountForm.value.PaidAmount == null
    ) {

      this.toastr.error('Bill Calculate Amount should not be blank.!', 'Error')
      return
    }


    if (this.StgAmountForm.invalid || this.StgAmountForm.value.ClientId == 0 || this.StgBillForm.invalid) {
      this.StgAmountForm.markAllAsTouched();
      this.StgBillForm.markAllAsTouched();
      return;
    }

    const StgObject: StgCollectionData[] = [];
    const PaymentObject: StgPaymentData[] = [];
    this.dataSource.data.forEach((selectedItem) => {
      // Create the selected object based on the selected item
      const selectedObject: StgCollectionData = {
        CollectionId: selectedItem.CollectionId ?? 0, // Assuming CollectionId is present in your data
      };
      // Push the selected object to the array
      StgObject.push(selectedObject);
    });

    this.paymentDataSource.data.forEach((selectedItem) => {
      // Create the selected object based on the selected item
      const selectedObject: StgPaymentData = {
        PaymentId: selectedItem.PaymentId ?? 0, // Assuming CollectionId is present in your data
      };
      // Push the selected object to the array
      PaymentObject.push(selectedObject);
    });

    let data: SaveStgBill = {

      BillDate: formatDate(this.StgAmountForm.value.BillDate, 'yyyy-MM-dd', 'en-US'),
      FromDate: formatDate(this.StgBillForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
      ToDate: formatDate(this.StgBillForm.value.toDate, 'yyyy-MM-dd', 'en-US'),
      ClientId: this.StgBillForm.value.ClientName?.ClientId,//this.StgBillForm.value.ClientId,
      FinalWeight: this.getTotal('FinalWeight') ?? 0,
      TotalStgAmount: this.getTotal('GrossAmount') ?? 0,
      TotalStgPayment: this.getTotalPayment('Amount') ?? 0,
      PreviousBalance: this.StgAmountForm.value.PreviousAmount ?? 0,
      StandingSeasonAdv: this.StgAmountForm.value.SeasonAmount ?? 0,
      Incentive: this.StgAmountForm.value.Incentive ?? 0,
      Transporting: this.StgAmountForm.value.Transporting ?? 0,
      GreenLeafCess: this.StgAmountForm.value.GreenLeafCess ?? 0,
      FinalBillAmount: this.StgAmountForm.value.FinalBillAmount ?? 0,
      LessSeasonAdv: this.StgAmountForm.value.LessSeasonAdv ?? 0,
      AmountToPay: this.StgAmountForm.value.AmountToPay ?? 0,
      PaidAmount: this.StgAmountForm.value.PaidAmount ?? 0,
      OutstandingAmount: this.StgAmountForm.value.OutstandingAmount ?? 0,
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
        this.isSubmitting = false;

      }
    });

  }

  async SaveBill(clientBody: SaveStgBill) {
    this.stgBillService.SaveStgBIll(clientBody)
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
          this.StgBillForm.controls[control].reset();
        });
      });


    this.dataSource.data = [];
    this.paymentDataSource.data = [];
    this.cleanAmountController();

    //this.ClientNoInput.nativeElement.focus();
    this.isSubmitting = false;
  }

  onFocusOutSeasonEvent(event: any) {
    debugger
    if ((this.StgAmountForm.value.SeasonAmount > 0) && (this.StgAmountForm.value.AmountToPay > 0)) {
      if (this.StgAmountForm.value.LessSeasonAdv == null || Number(this.StgAmountForm.value.LessSeasonAdv) == 0) {
        this.setValidation('LessSeasonAdv', "SeasonAdvValidate");
        this.SeasonAdvValidateMsg = "Enter Less Season Advance !";
      }
      else {
        this.clearEmailValidation('LessSeasonAdv')
        this.SeasonAdvValidate = false;
        this.SeasonAdvValidateMsg = '';

      }
    }
    else {
      this.clearEmailValidation('LessSeasonAdv')
      this.SeasonAdvValidate = false;
      this.SeasonAdvValidateMsg = '';

    }

    if (Number(this.StgAmountForm.value.LessSeasonAdv) > 0) {
      if (Number(this.StgAmountForm.controls['LessSeasonAdv'].value) > Number(this.StgAmountForm.controls['SeasonAmount'].value)) {
        this.setValidation("LessSeasonAdv", 'SeasonAdvValidate');

        this.SeasonAdvValidate = true;
        this.SeasonAdvValidateMsg = "Amount should less than Sea. Advance.";
      }
      else {
        this.clearEmailValidation('LessSeasonAdv')

        this.StgAmountForm.controls['LessSeasonAdv'].value.valid = true
        this.SeasonAdvValidate = false;
        this.SeasonAdvValidateMsg = "";
      }
    }
  }
  onFocusOutEvent(event: any) {

    if (this.StgAmountForm.value.PaidAmount == null) {
      this.setValidation('PaidAmount', 'PaidAmountValidate');
      this.PaidAmountErrorMsg = 'Amount should not Blank!'
      this.PaidAmountValidate = true;
    }

    else if (this.StgAmountForm.value.PaidAmount > this.StgAmountForm.value.AmountToPay) {
      this.setValidation('PaidAmount', 'PaidAmountValidate');
      this.PaidAmountErrorMsg = 'Amount should not more than Paybale!'
      this.PaidAmountValidate = true;
    }
    else {
      this.clearEmailValidation('PaidAmount')
      this.PaidAmountValidate = false;
    }
  }

  clearEmailValidation(controlName: string) {
    this.StgAmountForm.get(controlName)?.clearValidators();
    this.StgAmountForm.get(controlName)?.updateValueAndValidity();
    this.StgAmountForm.controls[controlName].setErrors(null);
    if (this.StgAmountForm.errors?.['invalid']) {
      this.StgAmountForm.setErrors(null);
    }

  }

  setValidation(controlName: string, errorVal: string) {
    this.StgAmountForm.get(controlName)?.setValidators([Validators.required]);
    this.StgAmountForm.get(controlName)?.updateValueAndValidity();
    const errorKey = errorVal;
    this.StgAmountForm.controls[controlName].setErrors({ [errorKey]: true });
    this.StgAmountForm.setErrors({ invalid: true });
  }

}
