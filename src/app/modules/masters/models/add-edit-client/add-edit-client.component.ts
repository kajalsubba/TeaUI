import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { IGetCategory } from '../../interfaces/iget-category';
import { CategoryService } from '../../services/category.service';
import { IsaveClient } from '../../interfaces/isave-client';
import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-add-edit-client',
  templateUrl: './add-edit-client.component.html',
  styleUrls: ['./add-edit-client.component.scss']
})
export class AddEditClientComponent implements OnInit, AfterViewInit {

  ClientForm!: FormGroup;
  loginDetails: any;
  CategoryList:any; 
  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<AddEditClientComponent>,
    private formBuilder:FormBuilder,
    private helper:HelperService,
    private toastr:ToastrService,
    private categoryService:CategoryService,
    private clientService:ClientService
  ){}
  
  ngAfterViewInit(): void {
    
  }
  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails')
    this.ClientForm = this.formBuilder.group({
      ClientId:[],
      ClientFirstName: ['', Validators.required],
      ClientMiddleName:[],
      ClientLastName:[],
      ClientAddress:[],
      ContactNo:[],
      EmailId:[],
      CategoryID:[],
      TenantId:[],
      IsActive:true,
      CreatedBy:[]
    });
    if(this.dialogData.value){
     // this.categoryForm.controls['categoryName'].setValue(this.dialogData.value.CategoryName);
    }
    this.getCategoryList();

  }
  getCategoryList(){
    let bodyData:IGetCategory = {
      TenantId:this.loginDetails.TenantId
    }
    const categoryListService = this.categoryService.getCategory(bodyData).subscribe((res:any)=>{
      this.CategoryList= res.CategoryDetails;
    });
    this.subscriptions.push(categoryListService);
  }

  onSubmit()
  {
    if(this.ClientForm.invalid){
      return;
    }else{
      let bodyData:IsaveClient = {
        ClientId :this.dialogData?.value?.ClientId? this.dialogData?.value?.ClientId : 0,
        ClientFirstName:this.ClientForm.value.ClientFirstName,
        ClientMiddleName:this.ClientForm.value.ClientMiddleName,
        ClientLastName:this.ClientForm.value.ClientLastName,
        ClientAddress:this.ClientForm.value.ClientAddress,
        ContactNo:this.ClientForm.value.ContactNo,
        EmailId:this.ClientForm.value.EmailId,
        CategoryID:this.ClientForm.value.CategoryID,
        IsActive:true,
        TenantId:this.loginDetails.TenantId,
        CreatedBy:this.loginDetails.CreatedBy

      }
        this.clientService.SaveClient(bodyData).subscribe((res:any)=>{
        console.log(res, "Save Response");
        // if(this.dialogData.buttonName == 'Save'){
        //   this.toastr.success("Category saved successfully", "SUCCESS");
        // }else if(this.dialogData.buttonName == "Update"){
        //   this.toastr.success("Category updated successfully", "SUCCESS")
        // }
        this.toastr.success(res.Message, "SUCCESS");

        this.ClientForm.reset();
    //    this.dialogRef.close(true)
      })
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub)=>{
      sub.unsubscribe();
      this.dialogRef.close(true);
    })
}


}
