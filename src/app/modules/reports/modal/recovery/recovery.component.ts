import { CurrencyPipe, formatDate } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { catchError, Subject, Subscription, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { environment } from 'src/environments/environment';
import { SaveRecoveryModel } from '../../interfaces/irecovery';
import { RecoveryService } from '../../services/recovery.service';

@Component({
  selector: 'app-recovery',
  templateUrl: './recovery.component.html',
  styleUrls: ['./recovery.component.scss']
})
export class RecoveryComponent implements OnInit {
  today: Date = new Date();
  keyword = 'FullName';
  formattedAmount: string = '';
  amountInWords: string = '';

  isSubmitting = false;
  @ViewChild('clientSelect') clientSelect!: MatSelect;

  RecoveryForm!: FormGroup;
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
    public dialogRef: MatDialogRef<RecoveryComponent>,
    private fb: FormBuilder,
    private helper: HelperService,
    private toastr: ToastrService,
    private currencyPipe: CurrencyPipe,
    private recoveryService: RecoveryService


  ) {

  }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.RecoveryForm = this.fb.group({
      RecoveryDate: [new Date(), Validators.required],
      ClientId: [''],
      ClientName: ['', Validators.required],
      Amount: ['', Validators.required],
      Narration: [''],
    });

    debugger
    if (this.dialogData.value) {
      this.RecoveryForm.controls['ClientId'].setValue(this.dialogData.value.ClientId);
      this.RecoveryForm.controls['ClientName'].setValue(this.dialogData.value.ClientName);

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

    this.RecoveryForm.controls["Amount"].setValue(formattedValue);

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
    if (this.RecoveryForm.invalid || this.RecoveryForm.value.ClientId == 0) {
      this.RecoveryForm.markAllAsTouched();
      return;
    }
    let data: SaveRecoveryModel = {
      RecoveryDate: formatDate(this.RecoveryForm.value.RecoveryDate, 'yyyy-MM-dd', 'en-US'),
      ClientId: this.RecoveryForm.value.ClientId,
      ClientCategory: this.dialogData.value.Category,
      CategoryId: this.dialogData.categoryId,
      RecoveryType: this.dialogData.value.RecoveryType,
      FieldBalance: Number(this.dialogData.value.Amount),
      Amount: this.RecoveryForm.value.Amount.toString().replace(/,/g, ''),
      Narration: this.RecoveryForm.value.Narration,
      TenantId: this.loginDetails.TenantId,
      CreatedBy: this.loginDetails.UserId

    }

    if (!environment.production) {

      console.log(data, 'add');
    }

    const rawAmount = this.RecoveryForm.value.Amount;
    const numericAmount = parseFloat(rawAmount?.toString().replace(/,/g, '') || '0');

    if (numericAmount > Number(this.dialogData.value.Amount)) {
      this.toastr.error("Recovery amount should not greater than balance!", "Error");
      return;
    }

    if (numericAmount > 0) {
      this.isSubmitting = true;
      this.SaveData(data);
    } else {
      this.toastr.warning("Please enter a valid Amount", "Amount");
    }

  }

  SaveData(clientBody: SaveRecoveryModel) {
    this.recoveryService.SaveRecovery(clientBody)
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

        this.isSubmitting = false;
        this.dialogRef.close(true);

      });
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

