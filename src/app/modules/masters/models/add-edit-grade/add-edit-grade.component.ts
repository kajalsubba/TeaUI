import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { HelperService } from 'src/app/core/services/helper.service';
import { GradeService } from '../../services/grade.service';
import { ISaveGrade } from '../../interfaces/IGrade';

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
  private gradeService:GradeService,
  private helper:HelperService,
  private toastr:ToastrService
) {

  
}
  ngAfterViewInit(): void {
    
  }

  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails')
    this.GradeForm = this.formBuilder.group({
    //  GradeId:[],
      GradeName: ['', Validators.required],
    });
    if(this.dialogData.value){
    //  this.GradeForm.controls['GradeId'].setValue(this.dialogData.value.GradeId);
      this.GradeForm.controls['GradeName'].setValue(this.dialogData.value.GradeName);
    }
  }

  onSubmit()
  {
    if(this.GradeForm.invalid){
      return;
    }else{
      let bodyData:ISaveGrade = {
        TenantId:this.loginDetails.TenantId,
        CreatedBy:this.loginDetails.CreatedBy,
        GradeId :this.dialogData?.value?.GradeId? this.dialogData?.value?.GradeId : 0,
        GradeName : this.GradeForm.value.GradeName
      }
      const saveCategory = this.gradeService.SaveGrade(bodyData).subscribe((res:any)=>{
        // console.log(res, "Save Response");
        // if(this.dialogData.buttonName == 'Save'){
        //   this.toastr.success("Category saved successfully", "SUCCESS");
        // }else if(this.dialogData.buttonName == "Update"){
           this.toastr.success(res.Message, "SUCCESS")
        // }
        this.dialogRef.close(true)
      })
    }
  }
}
