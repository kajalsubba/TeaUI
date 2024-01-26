import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { HelperService } from 'src/app/core/services/helper.service';
import { ISaveFactory } from '../../interfaces/IFactory';
import { FactoryService } from '../../services/factory.service';

@Component({
  selector: 'app-add-edit-factory',
  templateUrl: './add-edit-factory.component.html',
  styleUrls: ['./add-edit-factory.component.scss']
})
export class AddEditFactoryComponent {

  loginDetails:any;
  FactoryForm!: FormGroup;
  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<AddEditFactoryComponent>,
    private formBuilder:FormBuilder,
    private factoryService:FactoryService,
    private helper:HelperService,
    private toastr:ToastrService

  ) {  }

  ngAfterViewInit(): void {
    
  }

  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails')
    this.FactoryForm = this.formBuilder.group({
     // FactoryId:[],
      FactoryName:['', Validators.required],
      FactoryAddress:[],
      ContactNo:[, Validators.required],
      EmailId: ['', Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)],
  
    });
    if(this.dialogData.value){
      this.FactoryForm.controls['FactoryName'].setValue(this.dialogData.value.FactoryName);
      this.FactoryForm.controls['FactoryAddress'].setValue(this.dialogData.value.FactoryAddress);
      this.FactoryForm.controls['ContactNo'].setValue(this.dialogData.value.ContactNo);
      this.FactoryForm.controls['EmailId'].setValue(this.dialogData.value.EmailId);
    }
  }

  onSubmit()
  {
    if(this.FactoryForm.invalid){
      this.FactoryForm.markAllAsTouched();
      return;
    }else{
      let bodyData:ISaveFactory = {
        TenantId:this.loginDetails.TenantId,
        CreatedBy:this.loginDetails.UserId,
        FactoryId :this.dialogData?.value?.FactoryId? this.dialogData?.value?.FactoryId : 0,
        FactoryName : this.FactoryForm.value.FactoryName,
        FactoryAddress:this.FactoryForm.value.FactoryAddress,
        EmailId:this.FactoryForm.value.EmailId,
        ContactNo:this.FactoryForm.value.ContactNo,
        IsActive:true
      }
      const saveCategory = this.factoryService.SaveFactory(bodyData).subscribe((res:any)=>{
    //    console.log(res, "Save Response");
        // if(this.dialogData.buttonName == 'Save'){
        //   this.toastr.success(res.Message, "SUCCESS");
        // }else if(this.dialogData.buttonName == "Update"){
          this.toastr.success(res.Message, "SUCCESS")
      //  }
        this.dialogRef.close(true)
      })
    }
  }
}
