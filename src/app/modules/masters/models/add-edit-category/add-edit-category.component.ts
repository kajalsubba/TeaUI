import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CategoryService } from '../../services/category.service';
import { HelperService } from 'src/app/core/services/helper.service';
import { ToastrService } from 'ngx-toastr';
import { ISaveCategory } from '../../interfaces/ICategory';

@Component({
  selector: 'app-add-edit-category',
  templateUrl: './add-edit-category.component.html',
  styleUrls: ['./add-edit-category.component.scss']
})
export class AddEditCategoryComponent implements OnInit, AfterViewInit {

  categoryForm!: FormGroup;
  loginDetails: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<AddEditCategoryComponent>,
    private formBuilder:FormBuilder,
    private categoryService:CategoryService,
    private helper:HelperService,
    private toastr:ToastrService
  ){}

  ngAfterViewInit(): void {
    
  }

  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails')
    this.categoryForm = this.formBuilder.group({
      categoryName: ['', Validators.required],
    });
    if(this.dialogData.value){
      this.categoryForm.controls['categoryName'].setValue(this.dialogData.value.CategoryName);
    }
  }

  onSubmit(){
    if(this.categoryForm.invalid){
      this.categoryForm.markAllAsTouched();
      return;
    }else{
      let bodyData:ISaveCategory = {
        TenantId:this.loginDetails.TenantId,
        CreatedBy:this.loginDetails.UserId,
        CategoryId :this.dialogData?.value?.CategoryId? this.dialogData?.value?.CategoryId : 0,
        CategoryName : this.categoryForm.value.categoryName
      }
      const saveCategory = this.categoryService.saveCategory(bodyData).subscribe((res:any)=>{
        if(res.Id == 0){
          this.toastr.error(res.Message, "Exists");
        }else{
          this.toastr.success(res.Message, "SUCCESS");
        }
        this.dialogRef.close(true)
      })
    }
  }

}
