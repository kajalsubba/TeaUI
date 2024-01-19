import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClientService } from '../../services/client.service';
import { HelperService } from 'src/app/core/services/helper.service';
import { ToastrService } from 'ngx-toastr';
import { CategoryService } from '../../services/category.service';
import { IGetCategory } from '../../interfaces/ICategory';
import { Subject, Subscription, catchError, takeUntil } from 'rxjs';
import { ISaveClient } from '../../interfaces/IClient';

@Component({
  selector: 'app-add-edit-client',
  templateUrl: './add-edit-client.component.html',
  styleUrls: ['./add-edit-client.component.scss']
})
export class AddEditClientComponent implements OnInit {

  clientForm!: FormGroup;
  loginDetails: any;
  categoryList: any=[];
  private subscription:Subscription[]=[];

  private destroy$ = new Subject<void>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<AddEditClientComponent>,
    private fb:FormBuilder,
    private clientService:ClientService,
    private helper:HelperService,
    private categoryService:CategoryService,
    private toastr:ToastrService
  ){}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails')
    this.clientForm = this.fb.group({
      clientFirstName: ['', Validators.required],
      clientMiddleName: [''],
      clientLastName: ['', Validators.required],
      clientAddress: [''],
      ContactNo: [''],
      CategoryId:[null, Validators.required],
      isActive:[true],
      EmailId: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]]
    });
    await this.getCategoryList();
    if (this.dialogData.value) {
      this.clientForm.controls['clientFirstName'].setValue(this.dialogData.value.ClientFirstName);
      this.clientForm.controls['clientMiddleName'].setValue(this.dialogData.value.ClientMiddleName);
      this.clientForm.controls['clientLastName'].setValue(this.dialogData.value.ClientLastName);
      this.clientForm.controls['clientAddress'].setValue(this.dialogData.value.ClientAddress);
      this.clientForm.controls['ContactNo'].setValue(this.dialogData.value.ContactNo);
      this.clientForm.controls['EmailId'].setValue(this.dialogData.value.EmailId);
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

        this.categoryList = res.CategoryDetails;

        if (this.dialogData.value) {
            this.clientForm.controls['CategoryId'].setValue(this.dialogData.value.CategoryID);
        }

    } catch (error) {
        console.error('Error:', error);
        this.toastr.error('Something went wrong.', 'ERROR');
    }
}

  onSubmit(){
    if(this.clientForm.invalid){
      this.clientForm.markAllAsTouched();
    }
    if(this.dialogData.buttonName == "Save"){
      let data:ISaveClient = {
        ClientId:0,
        CategoryID:this.clientForm.value.CategoryId,
        ClientAddress:this.clientForm.value.clientAddress,
        ClientFirstName:this.clientForm.value.clientFirstName,
        ClientMiddleName:this.clientForm.value.clientMiddleName,
        ClientLastName:this.clientForm.value.clientLastName,
        ContactNo:this.clientForm.value.ContactNo,
        EmailId:this.clientForm.value.EmailId,
        TenantId:this.loginDetails.TenantId,
        CreatedBy:this.loginDetails.CreatedBy,
        IsActive:true
      }
      this.saveClientData(data);
    }else{
      let data:ISaveClient = {
        ClientId:this.dialogData?.value?.ClientId,
        CategoryID:this.dialogData?.value?.CategoryID,
        ClientAddress:this.dialogData?.value?.ClientAddress ? this.dialogData?.value?.ClientAddress : this.clientForm.value.clientAddress,
        ClientFirstName:this.dialogData?.value?.ClientFirstName,
        ClientMiddleName:this.dialogData?.value?.ClientMiddleName ? this.dialogData?.value?.ClientMiddleName :this.clientForm.value.clientMiddleName ,
        ClientLastName:this.dialogData?.value?.ClientLastName,
        ContactNo:this.dialogData?.value?.ContactNo ? this.dialogData?.value?.ContactNo : this.clientForm.value.ContactNo,
        EmailId:this.dialogData?.value?.EmailId,
        TenantId:this.loginDetails.TenantId,
        CreatedBy:this.loginDetails.CreatedBy,
        IsActive:this.clientForm.value.isActive
      }
      this.saveClientData(data);
    }
  }

  saveClientData(clientBody: ISaveClient) {
    this.clientService.saveClient(clientBody)
        .pipe(
            takeUntil(this.destroy$),
            catchError(error => {
                console.error('Error:', error);
                this.toastr.error('An error occurred', 'ERROR');
                throw error;
            })
        )
        .subscribe((res: any) => {
            console.log(res);
            this.toastr.success(res.Message, 'SUCCESS');
            this.dialogRef.close(true);
        });
}


}
