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
    this.dialogRef.close(true);
  }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails')
    this.clientForm = this.fb.group({
      ClientFirstName: ['', Validators.required],
      ClientMiddleName: [''],
      ClientLastName: ['', Validators.required],
      ClientAddress: [''],
      ContactNo: ['', Validators.required],
      CategoryId:[null, Validators.required],
      IsActive:[true],
      EmailId: ['', Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)],
      Password:['']
    });
  
    await this.getCategoryList();
    if (this.dialogData.value) {
      this.clientForm.controls['ClientFirstName'].setValue(this.dialogData.value.ClientFirstName);
      this.clientForm.controls['ClientMiddleName'].setValue(this.dialogData.value.ClientMiddleName);
      this.clientForm.controls['ClientLastName'].setValue(this.dialogData.value.ClientLastName);
      this.clientForm.controls['ClientAddress'].setValue(this.dialogData.value.ClientAddress);
      this.clientForm.controls['ContactNo'].setValue(this.dialogData.value.ContactNo);
      this.clientForm.controls['EmailId'].setValue(this.dialogData.value.EmailId);
      this.clientForm.controls['CategoryId'].setValue(this.dialogData.value.CategoryId);
      this.clientForm.controls['IsActive'].setValue(this.dialogData.value.IsActive);
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

        // if (this.dialogData.value) {
        //     this.clientForm.controls['CategoryId'].setValue(this.dialogData.value.CategoryId);
        // }

    } catch (error) {
        console.error('Error:', error);
        this.toastr.error('Something went wrong.', 'ERROR');
    }
}

  onSubmit(){
    if(this.clientForm.invalid){
      this.clientForm.markAllAsTouched();
      return;
    }
    // if(this.dialogData.buttonName == "Save"){
      let data:ISaveClient = {
        ClientId:this.dialogData?.value?.ClientId? this.dialogData?.value?.ClientId : 0,
        CategoryID:this.clientForm.value.CategoryId,
        ClientAddress:this.clientForm.value.ClientAddress,
        ClientFirstName:this.clientForm.value.ClientFirstName,
        ClientMiddleName:this.clientForm.value.ClientMiddleName,
        ClientLastName:this.clientForm.value.ClientLastName,
        ContactNo:this.clientForm.value.ContactNo.toString(),
        EmailId:this.clientForm.value.EmailId,
        Password:this.clientForm.value.Password,
        TenantId:this.loginDetails.TenantId,
        CreatedBy:this.loginDetails.UserId,
        IsActive:this.clientForm.value.IsActive,
      }
      this.saveClientData(data);
 
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
            //console.log(res);
            this.toastr.success(res.Message, 'SUCCESS');
           if (this.dialogData.buttonName == "Update")
           {
                this.dialogRef.close(true);
           }
        
          this.clientForm.reset();
        });
}


}
