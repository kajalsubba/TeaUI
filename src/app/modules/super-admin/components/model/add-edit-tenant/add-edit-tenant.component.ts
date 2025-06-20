import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { RoleService } from 'src/app/modules/user-management/services/role.service';
import { TenantServiceService } from '../../services/tenant-service.service';
import { ITenantSave } from '../../interfaces/itenant';

@Component({
  selector: 'app-add-edit-tenant',
  templateUrl: './add-edit-tenant.component.html',
  styleUrls: ['./add-edit-tenant.component.scss']
})
export class AddEditTenantComponent {
  TenantForm!: FormGroup;
  loginDetails: any;
  emailPattern: string = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$';
  passwordType: string = 'password';
  private subscriptions: Subscription[] = [];
  RoleList: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<AddEditTenantComponent>,
    private formBuilder: FormBuilder,
    private roleService: RoleService,
    private helper: HelperService,
    private toastr: ToastrService,
    private tenantService: TenantServiceService
  ) { }

  ngAfterViewInit(): void { }

  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails');

    this.TenantForm = this.formBuilder.group({
      TenantName: ['', Validators.required],
      TenantOwner: [''],
      TenantEmail: ['', Validators.pattern(this.emailPattern)],
      TenantContactNo: [
        '',
        [Validators.required, Validators.pattern('^[6-9]\\d{9}$')],
      ],
      UserName: ['', Validators.required],
      Password: ['', Validators.required],

      IsActive: [true, Validators.required],
    });
    if (this.dialogData.value) {

      this.TenantForm.controls['TenantName'].setValue(this.dialogData.value.TenantName);
      this.TenantForm.controls['TenantOwner'].setValue(this.dialogData.value.TenantOwner);
      this.TenantForm.controls['TenantEmail'].setValue(this.dialogData.value.TenantEmail);
      this.TenantForm.controls['TenantContactNo'].setValue(this.dialogData.value.TenantContactNo);
      this.TenantForm.controls['IsActive'].setValue(this.dialogData.value.IsActive);
    }
  }

  restrictInput(event: KeyboardEvent) {
    const charCode = event.charCode;
    if (charCode >= 48 && charCode <= 57) {
      return true;
    } else {
      return false;
    }
  }

  togglePassword(type: string) {
    this.passwordType = type;
  }



  onSubmit() {
    if (this.TenantForm.invalid) {
      this.TenantForm.markAllAsTouched();
      return;
    } else {


      let bodyData: ITenantSave = {
        TenantId: this.dialogData?.value?.TenantId ? this.dialogData?.value?.TenantId : 0,
        TenantName: this.TenantForm.value.TenantName,
        TenantOwner: this.TenantForm.value.TenantOwner,
        TenantEmail: this.TenantForm.value.TenantEmail,
        TenantContactNo: this.TenantForm.value.TenantContactNo,
        UserName:this.TenantForm.value.UserName,
        Password:this.TenantForm.value.Password,
        IsActive: this.TenantForm.value.IsActive,

      }
      const saveCategory = this.tenantService.SaveTenant(bodyData).subscribe((res: any) => {
        if (res.Id == 0) {
          this.toastr.error(res.Message, "Error");
        } else {
          this.toastr.success(res.Message, "SUCCESS");
        }
        this.dialogRef.close(true)
      })
    }


  }
}
