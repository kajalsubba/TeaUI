import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { HelperService } from 'src/app/core/services/helper.service';
import { PaymenttypeService } from '../../services/paymenttype.service';
import { IPaymentType } from '../../interfaces/ipayment-type';

@Component({
  selector: 'app-add-edit-payment-type',
  templateUrl: './add-edit-payment-type.component.html',
  styleUrls: ['./add-edit-payment-type.component.scss']
})
export class AddEditPaymentTypeComponent implements OnInit, AfterViewInit {

  PaymentTypeForm!: FormGroup;
  loginDetails: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<AddEditPaymentTypeComponent>,
    private formBuilder:FormBuilder,
    private paymentService:PaymenttypeService,
    private helper:HelperService,
    private toastr:ToastrService
  ){}
  ngAfterViewInit(): void {
    
  }

  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails')
    this.PaymentTypeForm = this.formBuilder.group({
      PaymentType: ['', Validators.required],
    });
    if(this.dialogData.value){
      this.PaymentTypeForm.controls['PaymentType'].setValue(this.dialogData.value.PaymentType);
    }
  }

  onSubmit()
  {
    if(this.PaymentTypeForm.invalid){
      this.PaymentTypeForm.markAllAsTouched();
      return;
    }else{
      let bodyData:IPaymentType = {
        TenantId:this.loginDetails.TenantId,
        CreatedBy:this.loginDetails.UserId,
        PaymentTypeId :this.dialogData?.value?.PaymentTypeId? this.dialogData?.value?.PaymentTypeId : 0,
        PaymentType : this.PaymentTypeForm.value.PaymentType
      }
      const saveCategory = this.paymentService.SavePaymentType(bodyData).subscribe((res:any)=>{
        console.log(res, "Save Response");
        if(res.Id == 0){
          this.toastr.error(res.Message, "Notification");
        }else{
          this.toastr.success(res.Message, "SUCCESS");
        }
        this.dialogRef.close(true)
      })
    }
  }
}
