import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { catchError, Subject, Subscription, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { AutoCompleteService } from 'src/app/modules/collection/services/auto-complete.service';
import { CategoryService } from 'src/app/modules/masters/services/category.service';
import { PaymenttypeService } from 'src/app/modules/masters/services/paymenttype.service';
import { PaymentService } from '../../services/payment.service';
import { CurrencyPipe, formatDate } from '@angular/common';
import { IGetTeaClient } from 'src/app/modules/collection/interfaces/istg';
import { MatOptionSelectionChange } from '@angular/material/core';
import { IGetPaymentType } from 'src/app/modules/masters/interfaces/ipayment-type';
import { IGetCategory } from 'src/app/modules/masters/interfaces/ICategory';
import { ISavePayment } from '../../interfaces/ipayment';
import { environment } from 'src/environments/environment';
import { IWalletBalance } from '../../interfaces/iwallet';
import { WalletService } from '../../services/wallet.service';

@Component({
  selector: 'app-wallet-paymentbyuser',
  templateUrl: './wallet-paymentbyuser.component.html',
  styleUrls: ['./wallet-paymentbyuser.component.scss']
})
export class WalletPaymentbyuserComponent implements OnInit {

  keyword = 'ClientName';
  isSubmitting = false;
  @ViewChild('clientSelect') clientSelect!: MatSelect;

  @ViewChild('clientName') ClientNoInput!: ElementRef;
  addEditPayment!: FormGroup;
  minToDate!: Date | null;
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();
  categoryList: any[] = [];
  paymentTypeList: any[] = [];
  narrationList: any[] = [];
  walletBalance: any[] = [];
  loginDetails: any;
  ClientNames: any[] = [];
  clientList: any[] = [];
  formattedAmount: any;
  filteredClient: any[] = [];
  @ViewChild('PaymentDate') PaymentDateInput!: ElementRef;
  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private helper: HelperService,
    private toastr: ToastrService,
    private autocompleteService: AutoCompleteService,
    private paymentTypeService: PaymenttypeService,
    private paymentService: PaymentService,
    private currencyPipe: CurrencyPipe,
    private walletService: WalletService

  ) {

  }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.addEditPayment = this.fb.group({
      PaymentDate: [new Date(), Validators.required],
      BillDate: [new Date(), Validators.required],
      CategoryId: ['', Validators.required],
      CategoryName: [''],
      ClientId: [''],
      ClientName: ['', Validators.required],
      PaymentTypeId: ['', Validators.required],
      Amount: ['', Validators.required],
      Narration: ['', Validators.required],
    });
    await this.getPaymentType();
    await this.getCategoryList();
    await this.loadClientNames();
    this.GetPaymentNarration();
    await this.GetWalletBalance();
  }

  selectEvent(item: any) {
    // do something with selected item
    console.log(item, 'item');
  }

  onChangeSearch(search: string) {
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  onFocused(e: any) {
    // do something
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

      this.ClientNames = res.ClientDetails;
      //  this.filteredClient = res.ClientDetails;
      // this.clientList = res.ClientDetails;

    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }

  onClientSelectOpened(opened: boolean, input: HTMLInputElement) {
    if (opened) {
      // Timeout is needed to wait for the panel to be fully rendered
      setTimeout(() => {
        input.focus();
      }, 0);
    }
  }
  filterNarration(value: string): any[] {

    const filterValue = value.toLowerCase();
    return this.narrationList.filter((x: any) => x?.Narration?.toLowerCase()?.includes(filterValue));
  }
  formatCurrency(event: any) {
    const value = event.target.value;
    const formattedValue = this.currencyPipe.transform(value, "INR",
      '',
      undefined,
      "en-IN");

    this.addEditPayment.controls["Amount"].setValue(formattedValue);

  }
  selectClient(client: any) {
    if (client == '') {
      this.addEditPayment.controls['ClientId'].reset();
    }
    //console.log(client.ClientId, 'Client');

    this.addEditPayment.controls['ClientId'].setValue(client?.ClientId);
  }


  async selectCategory(event: MatOptionSelectionChange, category: any) {
    if (event.source.selected) {
      this.filteredClient = [];
      this.clientList = [];
      this.addEditPayment.controls["ClientId"].reset();
      this.addEditPayment.controls['CategoryName'].setValue(category.CategoryName);
      var dataList = this.ClientNames.filter((x: any) => x.CategoryName.toLowerCase() == this.addEditPayment.value.CategoryName.toLowerCase() || x.CategoryName.toLowerCase() == 'Both'.toLowerCase())
      this.clientList = dataList;
      this.filteredClient = this.clientList
    }

  }

  GetPaymentNarration() {
    let bodyData: IGetPaymentType = {
      TenantId: this.loginDetails.TenantId,
    };
    const NarrationtService = this.paymentService.GetPaymentNarration(bodyData)
      .subscribe((res: any) => {

        this.narrationList = res.Narration;
        //  this.ClientNames = this.narrationList;
      });
    this.subscriptions.push(NarrationtService);
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


  async getPaymentType(): Promise<void> {
    try {
      const categoryBody: IGetPaymentType = {
        TenantId: this.loginDetails.TenantId
      };

      const res = await this.paymentTypeService.GetPaymentType(categoryBody)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.paymentTypeList = res.PaymentTypeDetails;


    } catch (error) {
      this.handleError(error, 'Failed to fetch payment types');
    }
  }



  async GetWalletBalance(): Promise<void> {
    try {
      const categoryBody: IWalletBalance = {
        TenantId: this.loginDetails.TenantId,
        UserId: this.loginDetails.UserId,
      };
      const res = await this.walletService.GetWalletBalanceData(categoryBody)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.walletBalance = res.WalletBalance[0].Amount;
      // console.log(this.walletBalance,'res.WalletBalance')

    } catch (error) {
      this.handleError(error, 'Failed to fetch payment types');
    }
  }

  private handleError(error: any, message: string): void {
    console.error('Error:', error);
    this.toastr.error(message, 'ERROR');
  }


  filterClientNames(value: string): any[] {
    debugger
    const filterValue = value.toLowerCase();
    return this.filteredClient = this.clientList.filter((x: any) => x?.ClientName?.toLowerCase()?.includes(filterValue));

  }


  onSubmit() {
    debugger
    if (this.addEditPayment.invalid || this.addEditPayment.value.ClientId == 0) {
      this.addEditPayment.markAllAsTouched();
      return;
    }
    let data: ISavePayment = {
      PaymentId: 0,
      PaymentDate: formatDate(this.addEditPayment.value.PaymentDate, 'yyyy-MM-dd', 'en-US'),
      BillDate: formatDate(this.addEditPayment.value.BillDate, 'yyyy-MM-dd', 'en-US'),
      ClientCategory: this.addEditPayment.value.CategoryName,
      ClientId: this.addEditPayment.value.ClientName.ClientId,
      PaymentTypeId: this.addEditPayment.value.PaymentTypeId,
      Amount: this.addEditPayment.value.Amount.toString().replace(/,/g, ''),
      Narration: this.addEditPayment.value.Narration,
      CategoryId: this.addEditPayment.value.CategoryId,
      TenantId: this.loginDetails.TenantId,
      CreatedBy: this.loginDetails.UserId,
      PaymentSource: 'Wallet'

    }

    if (!environment.production) {

      console.log(data, 'add');
    }

    this.isSubmitting = true;

    if (Number(this.addEditPayment.value.Amount.toString().replace(/,/g, '')) <= Number(this.walletBalance)) {
      this.SaveData(data);
    }
    else {
      this.toastr.warning("You does't have sufficient balance.", "Wallet")
    }

  }


  SaveData(clientBody: ISavePayment) {
    this.paymentService.SavePaymentData(clientBody)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.isSubmitting = false;
          console.error('Error:', error);
          this.toastr.error('An error occurred', 'ERROR');
          throw error;
        })
      )
      .subscribe((res: any) => {
        if (res.Id == 0) {
          this.toastr.warning(res.Message, 'Warning');
        }
        else {
          this.toastr.success(res.Message, 'SUCCESS');
        }


        this.CleanFormControl();
        this.GetWalletBalance();
        this.PaymentDateInput.nativeElement.focus();

        this.isSubmitting = false;

      });
  }

  CleanFormControl() {

    this.addEditPayment.controls['ClientName'].reset()
    this.addEditPayment.controls['ClientId'].reset()
    // this.addEditPayment.controls['CategoryId'].reset()
    this.addEditPayment.controls['Amount'].reset()
    this.addEditPayment.controls['PaymentTypeId'].reset()
    this.addEditPayment.controls['Narration'].reset()

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    })
  }

}
