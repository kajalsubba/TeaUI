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
import { formatDate } from '@angular/common';
import { IGetCategory } from 'src/app/modules/masters/interfaces/ICategory';
import { CategoryService } from 'src/app/modules/masters/services/category.service';
import { MatOptionSelectionChange } from '@angular/material/core';
import { PaymenttypeService } from 'src/app/modules/masters/services/paymenttype.service';
import { IGetPaymentType } from 'src/app/modules/masters/interfaces/ipayment-type';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-add-edit-payment',
  templateUrl: './add-edit-payment.component.html',
  styleUrls: ['./add-edit-payment.component.scss']
})
export class AddEditPaymentComponent implements OnInit {

  addEditPayment!: FormGroup;
  minToDate!: Date | null;
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();
  categoryList: any[]=[];
  paymentTypeList: any[]=[];
  loginDetails: any;
  ClientNames: any[] = [];
  @ViewChild('PaymentDate') PaymentDateInput!: ElementRef;
  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<AddEditPaymentComponent>,
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private helper: HelperService,
    private toastr: ToastrService,
    private autocompleteService: AutoCompleteService,
    private paymentTypeService:PaymenttypeService,
    private paymentService:PaymentService
  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.addEditPayment = this.fb.group({
      PaymentDate: [new Date(), Validators.required],
      CategoryId: ['',Validators.required],
      CategoryName: [''],
      ClientId: [''],
      ClientName: ['',Validators.required],
      PaymentTypeId: ['',Validators.required],
      Amount: ['',Validators.required],
      Narration: [''],
    });
   await this.getPaymentType();
   await this.getCategoryList();
  }

  displayWithFn(value: string): string {
    return value || '';
  }

  async loadClientNames() {
    try {
      const bodyData: IGetTeaClient = {
        TenantId: this.loginDetails.TenantId,
        Category: this.addEditPayment.value.CategoryName

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

  filterClientNames(value: string): any[] {

    const filterValue = value.toLowerCase();
    return this.ClientNames.filter((x: any) => x?.ClientName?.toLowerCase()?.includes(filterValue));
  }

  selectClient(client: any) {
    if (client == '') {
      this.addEditPayment.controls['ClientId'].reset();
    }
    console.log(client.ClientId, 'Client');

    this.addEditPayment.controls['ClientId'].setValue(client?.ClientId);
  }

  async selectCategory(event: MatOptionSelectionChange, category: any) {
    if (event.source.selected) {
      this.addEditPayment.controls['CategoryName'].setValue(category.CategoryName);
      await this.loadClientNames();
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

  async getPaymentType() {
    try {
      const categoryBody: IGetPaymentType = {
        TenantId: this.loginDetails.TenantId
      };

      const res: any = await this.paymentTypeService.GetPaymentType(categoryBody)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.paymentTypeList = res.PaymentTypeDetails;


    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }
  onSubmit() {
    if (this.addEditPayment.invalid || this.addEditPayment.value.ClientId == 0) {
      this.addEditPayment.markAllAsTouched();
      return;
    }
    let data: ISavePayment = {
      PaymentId: this.dialogData?.value?.PaymentId ? this.dialogData?.value?.PaymentId : 0,
      PaymentDate: formatDate(this.addEditPayment.value.PaymentDate, 'yyyy-MM-dd', 'en-US'),
      ClientCategory: this.addEditPayment.value.CategoryName,
      ClientId: this.addEditPayment.value.ClientId,
      PaymentTypeId: this.addEditPayment.value.PaymentTypeId,
      Amount: this.addEditPayment.value.Amount,
      Narration: this.addEditPayment.value.Narration,
      TenantId: this.loginDetails.TenantId,
      CreatedBy: this.loginDetails.UserId

    }

    console.log(data,'add');
    this.SaveData(data);
  }

  SaveData(clientBody: ISavePayment) {
    this.paymentService.SavePaymentData(clientBody)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
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

}
