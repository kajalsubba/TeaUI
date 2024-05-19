import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription, catchError, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { IGetTeaClient } from 'src/app/modules/collection/interfaces/istg';
import { AutoCompleteService } from 'src/app/modules/collection/services/auto-complete.service';
import { StgApproveService } from 'src/app/modules/collectionApprove/services/stg-approve.service';
import { ISavePayment } from '../../interfaces/ipayment';
import { CurrencyPipe, formatDate, registerLocaleData } from '@angular/common';
import { IGetCategory } from 'src/app/modules/masters/interfaces/ICategory';
import { CategoryService } from 'src/app/modules/masters/services/category.service';
import { MatOptionSelectionChange } from '@angular/material/core';
import { PaymenttypeService } from 'src/app/modules/masters/services/paymenttype.service';
import { IGetPaymentType } from 'src/app/modules/masters/interfaces/ipayment-type';
import { PaymentService } from '../../services/payment.service';
import { environment } from 'src/environments/environment';
import enIN from '@angular/common/locales/en-IN';
registerLocaleData(enIN);

@Component({
  selector: 'app-add-edit-payment',
  templateUrl: './add-edit-payment.component.html',
  styleUrls: ['./add-edit-payment.component.scss']
})
export class AddEditPaymentComponent implements OnInit {

  isSubmitting = false;
  addEditPayment!: FormGroup;
  minToDate!: Date | null;
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();
  categoryList: any[] = [];
  paymentTypeList: any[] = [];
  loginDetails: any;
  ClientNames: any[] = [];
  clientList: any[] = [];
  formattedAmount:any;

  @ViewChild('PaymentDate') PaymentDateInput!: ElementRef;
  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<AddEditPaymentComponent>,
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private helper: HelperService,
    private toastr: ToastrService,
    private autocompleteService: AutoCompleteService,
    private paymentTypeService: PaymenttypeService,
    private paymentService: PaymentService,
    private currencyPipe: CurrencyPipe

  ) {

   }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.addEditPayment = this.fb.group({
      PaymentDate: [new Date(), Validators.required],
      BillDate:[new Date(), Validators.required],
      CategoryId: ['', Validators.required],
      CategoryName: [''],
      ClientId: [''],
      ClientName: ['', Validators.required],
      PaymentTypeId: ['', Validators.required],
      Amount: ['', Validators.required],
      Narration: [''],
    });
    await this.getPaymentType();
    await this.getCategoryList();
    await this.loadClientNames();

    if (this.dialogData.value) {
      this.addEditPayment.controls['BillDate'].setValue(new Date(this.dialogData.value.BllDate));
      this.addEditPayment.controls['PaymentDate'].setValue(new Date(this.dialogData.value.PayDate));
      this.addEditPayment.controls['CategoryId'].setValue(this.dialogData.value.CategoryId);
      this.addEditPayment.controls['ClientId'].setValue(this.dialogData.value.ClientId);
      this.addEditPayment.controls['ClientName'].setValue(this.dialogData.value.ClientName);
      this.addEditPayment.controls['PaymentTypeId'].setValue(this.dialogData.value.PaymentTypeId);
      const formattedValue = this.currencyPipe.transform(this.dialogData.value.Amount,  "INR",
      '',
      undefined,
      "en-IN");
      this.addEditPayment.controls['Amount'].setValue(formattedValue);
      this.addEditPayment.controls['Narration'].setValue(this.dialogData.value.Narration);
    }
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

      this.clientList = res.ClientDetails;


    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }

  filterClientNames(value: string): any[] {

    const filterValue = value.toLowerCase();
    return this.ClientNames.filter((x: any) => x?.ClientName?.toLowerCase()?.includes(filterValue));
  }
  formatCurrency(event: any) {
    const value = event.target.value;
    const formattedValue = this.currencyPipe.transform(value,  "INR",
    '',
    undefined,
    "en-IN");
    console.log(formattedValue,'formattedValue');
    
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
      this.addEditPayment.controls['CategoryName'].setValue(category.CategoryName);
      var dataList = this.clientList.filter((x: any) => x.CategoryName.toLowerCase() == this.addEditPayment.value.CategoryName.toLowerCase() || x.CategoryName.toLowerCase() == 'Both'.toLowerCase())
      this.ClientNames = dataList;

    }

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

  private handleError(error: any, message: string): void {
    console.error('Error:', error);
    this.toastr.error(message, 'ERROR');
  }

  onSubmit() {
    if (this.addEditPayment.invalid || this.addEditPayment.value.ClientId == 0) {
      this.addEditPayment.markAllAsTouched();
      return;
    }
    let data: ISavePayment = {
      PaymentId: this.dialogData?.value?.PaymentId ? this.dialogData?.value?.PaymentId : 0,
      PaymentDate: formatDate(this.addEditPayment.value.PaymentDate, 'yyyy-MM-dd', 'en-US'),
      BillDate: formatDate(this.addEditPayment.value.BillDate, 'yyyy-MM-dd', 'en-US'),
      ClientCategory: this.addEditPayment.value.CategoryName,
      ClientId: this.addEditPayment.value.ClientId,
      PaymentTypeId: this.addEditPayment.value.PaymentTypeId,
      Amount: this.addEditPayment.value.Amount.toString().replace(/,/g,''),
      Narration: this.addEditPayment.value.Narration,
      CategoryId:this.addEditPayment.value.CategoryId,
      TenantId: this.loginDetails.TenantId,
      CreatedBy: this.loginDetails.UserId

    }

    if (!environment.production) {

      console.log(data, 'add');
    }

    this.isSubmitting = true;

    this.SaveData(data);
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
        if (this.dialogData.buttonName == "Update") {
          this.dialogRef.close(true);
        }

        this.CleanFormControl();
        this.PaymentDateInput.nativeElement.focus();

        this.isSubmitting = false;

      });
  }

  CleanFormControl() {

    this.addEditPayment.controls['ClientName'].reset()
    this.addEditPayment.controls['ClientId'].reset()
    this.addEditPayment.controls['CategoryId'].reset()
    this.addEditPayment.controls['Amount'].reset()
    this.addEditPayment.controls['PaymentTypeId'].reset()
    this.addEditPayment.controls['Narration'].reset()

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    })
    this.dialogRef.close(true);
  }

}
