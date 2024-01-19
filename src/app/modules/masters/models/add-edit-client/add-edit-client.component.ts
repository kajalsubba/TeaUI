import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClientService } from '../../services/client.service';
import { HelperService } from 'src/app/core/services/helper.service';
import { ToastrService } from 'ngx-toastr';
import { CategoryService } from '../../services/category.service';
import { IGetCategory } from '../../interfaces/ICategory';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-edit-client',
  templateUrl: './add-edit-client.component.html',
  styleUrls: ['./add-edit-client.component.scss']
})
export class AddEditClientComponent implements OnInit {

  clientForm!: FormGroup;
  loginDetails: any;
  categoryList: any=[];
  private subscription:Subscription[]=[]

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<AddEditClientComponent>,
    private fb:FormBuilder,
    private clientService:ClientService,
    private helper:HelperService,
    private categoryService:CategoryService,
    private toastr:ToastrService
  ){}

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails')
    this.clientForm = this.fb.group({
      clientFirstName: ['', Validators.required],
      clientMiddleName: [''],
      clientLastName: ['', Validators.required],
      clientAddress: [''],
      ContactNo: [''],
      CategoryId:[null, Validators.required],
      EmailId: ['', [Validators.required,Validators.email]]
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

  async getCategoryList(){
    try {
      let categoryBody:IGetCategory = {
        TenantId: this.loginDetails.TenantId
      }
      const getCategoryService = this.categoryService.getCategory(categoryBody).subscribe((res:any)=>{
        this.categoryList = res.CategoryDetails;
      })
      this.subscription.push(getCategoryService);
    } catch (error) {
      this.toastr.error("Something went wrong.", "ERROR");
    }
  }

  onSubmit(){
    if(this.clientForm.invalid){
      this.clientForm.markAllAsTouched();
    }
  }

}
