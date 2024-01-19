import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { HelperService } from 'src/app/core/services/helper.service';

@Component({
  selector: 'app-add-edit-grade',
  templateUrl: './add-edit-grade.component.html',
  styleUrls: ['./add-edit-grade.component.scss']
})
export class AddEditGradeComponent implements OnInit, AfterViewInit{

  GradeForm!: FormGroup;
  loginDetails: any;

/**
 *
 */
constructor(

  @Inject(MAT_DIALOG_DATA) public dialogData: any,
  public dialogRef: MatDialogRef<AddEditGradeComponent>,
  private formBuilder:FormBuilder,
 // private categoryService:CategoryService,
  private helper:HelperService,
  private toastr:ToastrService
) {

  
}
  ngAfterViewInit(): void {
    
  }

  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails')
    // this.categoryForm = this.formBuilder.group({
    //   categoryName: ['', Validators.required],
    // });
    if(this.dialogData.value){
   //   this.categoryForm.controls['categoryName'].setValue(this.dialogData.value.CategoryName);
    }
  }

  onSubmit()
  {
    // if(this.GradeForm.invalid){
    //   return;
    // }else{
    //   let bodyData:IsaveGrade = {
    //     TenantId:this.loginDetails.TenantId,
    //     CreatedBy:this.loginDetails.CreatedBy,
    //     CategoryId :this.dialogData?.value?.CategoryId? this.dialogData?.value?.CategoryId : 0,
    //     CategoryName : this.categoryForm.value.categoryName
    //   }
    //   const saveCategory = this.categoryService.saveCategory(bodyData).subscribe((res:any)=>{
    //     console.log(res, "Save Response");
    //     if(this.dialogData.buttonName == 'Save'){
    //       this.toastr.success("Category saved successfully", "SUCCESS");
    //     }else if(this.dialogData.buttonName == "Update"){
    //       this.toastr.success("Category updated successfully", "SUCCESS")
    //     }
    //     this.dialogRef.close(true)
    //   })
    // }
  }
}
