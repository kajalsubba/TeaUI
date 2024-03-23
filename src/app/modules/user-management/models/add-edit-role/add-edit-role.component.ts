import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { HelperService } from 'src/app/core/services/helper.service';
import { ISaveRole } from '../../interfaces/irole';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-add-edit-role',
  templateUrl: './add-edit-role.component.html',
  styleUrls: ['./add-edit-role.component.scss']
})
export class AddEditRoleComponent implements OnInit, AfterViewInit {


  RoleForm!: FormGroup;
  loginDetails: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<AddEditRoleComponent>,
    private formBuilder:FormBuilder,
    private roleService:RoleService,
    private helper:HelperService,
    private toastr:ToastrService
  ){}

  ngAfterViewInit(): void {
    
  }

  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails')
    this.RoleForm = this.formBuilder.group({
      RoleName: ['', Validators.required],
      RoleDescription: ['']
    });
    if(this.dialogData.value){
     this.RoleForm.controls['RoleName'].setValue(this.dialogData.value.RoleName);
     this.RoleForm.controls['RoleDescription'].setValue(this.dialogData.value.RoleDescription);
    }
  }




  onSubmit()
  {
    if(this.RoleForm.invalid){
      this.RoleForm.markAllAsTouched();
      return;
    }else{
      let bodyData:ISaveRole = {
        UserRoleId :this.dialogData?.value?.UserRoleId? this.dialogData?.value?.UserRoleId : 0,
        RoleName : this.RoleForm.value.RoleName,
        RoleDescription : this.RoleForm.value.RoleDescription,
        TenantId:this.loginDetails.TenantId,
        CreatedBy:this.loginDetails.UserId,
   
     
      }
      const saveCategory = this.roleService.CreateRole(bodyData).subscribe((res:any)=>{
    
        if(res.Id == 0){
          this.toastr.error(res.Message, "Error");
        }else{
          this.toastr.success(res.Message, "SUCCESS");
        }
        this.dialogRef.close(true)
      })
    }
  }
}
