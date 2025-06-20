import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { catchError, Subject, Subscription, takeUntil } from 'rxjs';
import { AutoCompleteService } from 'src/app/modules/collection/services/auto-complete.service';
import { CategoryService } from 'src/app/modules/masters/services/category.service';
import { PaymenttypeService } from 'src/app/modules/masters/services/paymenttype.service';
import { PaymentService } from '../../services/payment.service';
import { WalletService } from '../../services/wallet.service';
import { HelperService } from 'src/app/core/services/helper.service';
import { ToastrService } from 'ngx-toastr';
import { CurrencyPipe, formatDate } from '@angular/common';
import { IGetTeaClient } from 'src/app/modules/collection/interfaces/istg';
import { MatOptionSelectionChange } from '@angular/material/core';
import { IGetPaymentType } from 'src/app/modules/masters/interfaces/ipayment-type';
import { IGetCategory } from 'src/app/modules/masters/interfaces/ICategory';
import { IPettyCashBook, IWalletBalance } from '../../interfaces/iwallet';
import { ISavePayment } from '../../interfaces/ipayment';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-petty-cashbook',
  templateUrl: './petty-cashbook.component.html',
  styleUrls: ['./petty-cashbook.component.scss']
})
export class PettyCashbookComponent implements OnInit {
  today: Date = new Date();
  keyword = 'ClientName';
  amountInWords: string = '';
  isSubmitting = false;
  @ViewChild('clientSelect') clientSelect!: MatSelect;

  @ViewChild('clientName') ClientNoInput!: ElementRef;
  PettyCashBookForm!: FormGroup;
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
    this.PettyCashBookForm = this.fb.group({
      CashBookId: [0],
      PaymentDate: [new Date(), Validators.required],
      UserId: [0],
      PaymentTypeId: ['', Validators.required],
      Amount: ['', Validators.required],
      Narration: ['', Validators.required],
    });
    await this.getPaymentType();
    // this.GetPaymentNarration();
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

    this.PettyCashBookForm.controls["Amount"].setValue(formattedValue);

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




  onSubmit() {
    debugger
    if (this.PettyCashBookForm.invalid || this.PettyCashBookForm.value.ClientId == 0) {
      this.PettyCashBookForm.markAllAsTouched();
      return;
    }
    let data: IPettyCashBook = {
      CashBookId: 0,
      PaymentDate: formatDate(this.PettyCashBookForm.value.PaymentDate, 'yyyy-MM-dd', 'en-US'),
      PaymentTypeId: this.PettyCashBookForm.value.PaymentTypeId,
      Amount: this.PettyCashBookForm.value.Amount.toString().replace(/,/g, ''),
      Narration: this.PettyCashBookForm.value.Narration,
      UserId: this.loginDetails.UserId,
      TenantId: this.loginDetails.TenantId,
      CreatedBy: this.loginDetails.UserId,

    }

    if (!environment.production) {

      console.log(data, 'add');
    }

    this.isSubmitting = true;

    if (Number(this.PettyCashBookForm.value.Amount.toString().replace(/,/g, '')) <= Number(this.walletBalance)) {

      const rawAmount = this.PettyCashBookForm.value.Amount;
      const numericAmount = parseFloat(rawAmount?.toString().replace(/,/g, '') || '0');

      if (numericAmount > 0) {
        this.isSubmitting = true;
        this.SaveData(data);
      } else {
        this.toastr.warning("Please enter a valid Amount", "Amount");
      }
    }
    else {
      this.toastr.warning("You does't have sufficient balance.", "Wallet")
    }

  }


  SaveData(clientBody: IPettyCashBook) {
    this.walletService.SavePettyCashBook(clientBody)
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

    this.PettyCashBookForm.controls['Amount'].reset()
    this.PettyCashBookForm.controls['PaymentTypeId'].reset()
    this.amountInWords = '';
    this.PettyCashBookForm.controls['Narration'].reset()

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    })
  }

  updateAmountInWords(event: Event): void {
    const input = (event.target as HTMLInputElement).value.replace(/,/g, '');
    const number = parseInt(input, 10);
    if (!isNaN(number)) {
      this.amountInWords = this.convertNumberToWords(number) + ' only';
    } else {
      this.amountInWords = '';
    }
  }
  convertNumberToWords(amount: number): string {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
      "Sixteen", "Seventeen", "Eighteen", "Nineteen"];

    const numToWords = (num: number): string => {
      if (num === 0) return "Zero";
      if (num < 10) return ones[num];
      if (num >= 10 && num < 20) return teens[num - 10];
      if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
      if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " and " + numToWords(num % 100) : "");
      if (num < 100000) return numToWords(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + numToWords(num % 1000) : "");
      if (num < 10000000) return numToWords(Math.floor(num / 100000)) + " Lakh" + (num % 100000 ? " " + numToWords(num % 100000) : "");
      return numToWords(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 ? " " + numToWords(num % 10000000) : "");
    };

    const amountParts = amount.toString().split('.');
    const rupees = parseInt(amountParts[0], 10);
    const paise = amountParts[1] ? parseInt(amountParts[1].slice(0, 2).padEnd(2, '0'), 10) : 0;

    let words = '';
    if (rupees > 0) {
      words += numToWords(rupees) + " Rupee" + (rupees > 1 ? "s" : "");
    }
    if (paise > 0) {
      words += (rupees > 0 ? " and " : "") + numToWords(paise) + " Paise";
    }

    return words ? words : "Zero Rupees only";
  }

}
