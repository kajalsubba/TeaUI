import { CurrencyPipe, formatDate } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { catchError, Subject, Subscription, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/app/modules/user-management/services/user.service';
import { IGetUser } from 'src/app/modules/user-management/interfaces/iuser';
import { WalletService } from '../../services/wallet.service';
import { ISaveWallet } from '../../interfaces/iwallet';

@Component({
  selector: 'app-add-edit-wallet',
  templateUrl: './add-edit-wallet.component.html',
  styleUrls: ['./add-edit-wallet.component.scss']
})
export class AddEditWalletComponent implements OnInit {

  keyword = 'FullName';
  formattedAmount: string = '';
  amountInWords: string = '';

  isSubmitting = false;
  @ViewChild('clientSelect') clientSelect!: MatSelect;

  addEditUserWallet!: FormGroup;
  minToDate!: Date | null;
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();

  narrationList: any[] = [];
  loginDetails: any;

  userList: any[] = [];

  filteredClient: any[] = [];
  @ViewChild('PaymentDate') PaymentDateInput!: ElementRef;
  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<AddEditWalletComponent>,
    private fb: FormBuilder,
    private helper: HelperService,
    private toastr: ToastrService,
    private walletService: WalletService,
    private currencyPipe: CurrencyPipe,
    private userService: UserService


  ) {

  }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.addEditUserWallet = this.fb.group({
      PaymentDate: [new Date(), Validators.required],
      UserId: [''],

      FullName: ['', Validators.required],
      Amount: ['', Validators.required],
      Narration: [''],
    });

    await this.GetUserList();
    if (this.dialogData.value) {
      this.addEditUserWallet.controls['PaymentDate'].setValue(new Date(this.dialogData.value.PayDate));
      this.addEditUserWallet.controls['UserId'].setValue(this.dialogData.value.UserId);
      this.addEditUserWallet.controls['FullName'].setValue(this.dialogData.value.FullName);
      const formattedValue = this.currencyPipe.transform(this.dialogData.value.Amount, "INR",
        '',
        undefined,
        "en-IN");
      this.addEditUserWallet.controls['Amount'].setValue(formattedValue);
      this.addEditUserWallet.controls['Narration'].setValue(this.dialogData.value.Narration);
    }
  }

  async GetUserList() {

    try {
      const categoryBody: IGetUser = {
        TenantId: this.loginDetails.TenantId,
      };

      const res: any = await this.userService
        .GetUser(categoryBody)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.userList = res.UserDetails.filter((x: any) => x.RoleName.toLowerCase() != 'admin');
      this.filteredClient = this.userList;
      console.log(this.userList, 'this.userList');

    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
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

  // async loadClientNames() {
  //   try {
  //     const bodyData: IGetTeaClient = {
  //       TenantId: this.loginDetails.TenantId,
  //       Category: ''

  //     };

  //     const res: any = await this.autocompleteService.GetClientNames(bodyData)
  //       .pipe(takeUntil(this.destroy$))
  //       .toPromise();

  //     this.ClientNames = res.ClientDetails;

  //   } catch (error) {
  //     console.error('Error:', error);
  //     this.toastr.error('Something went wrong.', 'ERROR');
  //   }
  // }

  onClientSelectOpened(opened: boolean, input: HTMLInputElement) {
    if (opened) {
      // Timeout is needed to wait for the panel to be fully rendered
      setTimeout(() => {
        input.focus();
      }, 0);
    }
  }

  formatCurrency(event: any) {
    const value = event.target.value;
    const formattedValue = this.currencyPipe.transform(value, "INR",
      '',
      undefined,
      "en-IN");

    this.addEditUserWallet.controls["Amount"].setValue(formattedValue);

  }


  private handleError(error: any, message: string): void {
    console.error('Error:', error);
    this.toastr.error(message, 'ERROR');
  }


  filterClientNames(value: string): any[] {
    debugger
    const filterValue = value.toLowerCase();
    return this.filteredClient = this.userList.filter((x: any) => x?.FullName?.toLowerCase()?.includes(filterValue));

  }


  onSubmit() {

    if (this.addEditUserWallet.invalid || this.addEditUserWallet.value.ClientId == 0) {
      this.addEditUserWallet.markAllAsTouched();
      return;
    }
    let data: ISaveWallet = {
      WalletId: this.dialogData?.value?.WalletId ? this.dialogData?.value?.WalletId : 0,
      PaymentDate: formatDate(this.addEditUserWallet.value.PaymentDate, 'yyyy-MM-dd', 'en-US'),
      UserId: this.addEditUserWallet.value.FullName.UserId,
      Amount: this.addEditUserWallet.value.Amount.toString().replace(/,/g, ''),
      Narration: this.addEditUserWallet.value.Narration,
      TenantId: this.loginDetails.TenantId,
      CreatedBy: this.loginDetails.UserId

    }

    if (!environment.production) {

      console.log(data, 'add');
    }

    const rawAmount = this.addEditUserWallet.value.Amount;
    const numericAmount = parseFloat(rawAmount?.toString().replace(/,/g, '') || '0');

    if (numericAmount > 0) {
      this.isSubmitting = true;
      this.SaveData(data);
    } else {
      this.toastr.warning("Please enter a valid Amount", "Amount");
    }

  }

  SaveData(clientBody: ISaveWallet) {
    this.walletService.SaveUserWallet(clientBody)
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
        if (this.dialogData.buttonName == "Update") {
          this.dialogRef.close(true);
        }

        this.CleanFormControl();
        this.PaymentDateInput.nativeElement.focus();

        this.isSubmitting = false;

      });
  }

  CleanFormControl() {

    this.addEditUserWallet.controls['FullName'].reset()
    this.addEditUserWallet.controls['UserId'].reset()
    this.amountInWords = '';
    this.addEditUserWallet.controls['Amount'].reset()
    this.addEditUserWallet.controls['Narration'].reset()

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    })
    this.dialogRef.close(true);
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

    return numToWords(amount);
  }

}

