import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { HelperService } from 'src/app/core/services/helper.service';
import { RoleService } from '../../services/role.service';
import { IGetRole } from '../../interfaces/irole';
import { Subscription } from 'rxjs';
import { IUserSave } from '../../interfaces/iuser';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-add-edit-user',
  templateUrl: './add-edit-user.component.html',
  styleUrls: ['./add-edit-user.component.scss'],
})
export class AddEditUserComponent {
  UserForm!: FormGroup;
  loginDetails: any;
  emailPattern: string = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$';
  passwordType: string = 'password';
  private subscriptions: Subscription[] = [];
  RoleList: any[]=[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<AddEditUserComponent>,
    private formBuilder: FormBuilder,
    private roleService: RoleService,
    private helper: HelperService,
    private toastr: ToastrService,
    private userService:UserService
  ) {}

  ngAfterViewInit(): void {}

  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.GetRoleList();
    this.UserForm = this.formBuilder.group({
      UserFirstName: ['', Validators.required],
      UserMiddleName: [''],
      UserLastName: ['', Validators.required],
      UserEmail: [
        '',
        [ Validators.pattern(this.emailPattern)],
      ],
      ContactNo: [
        '',
        [Validators.required, Validators.pattern('^[6-9]\\d{9}$')],
      ],
      LoginUserName: ['', Validators.required],
      Password: ['', Validators.required],
      UserRoleId: ['', Validators.required],
      IsActive: [true, Validators.required],
    });
    if (this.dialogData.value) {
    }
  }

  restrictInput(event: KeyboardEvent) {
    const charCode = event.charCode;
    console.log(charCode);
    if (charCode >= 48 && charCode <= 57) {
      return true;
    } else {
      return false;
    }
  }

  togglePassword(type: string) {
    this.passwordType = type;
  }

  GetRoleList() {
    let bodyData: IGetRole = {
      TenantId: this.loginDetails.TenantId,
    };
    const categoryListService = this.roleService
      .GetRole(bodyData)
      .subscribe((res: any) => {
        this.RoleList = res.RoleDetails
      });
    this.subscriptions.push(categoryListService);
  }

  onSubmit() {
    if (this.UserForm.invalid) {
      this.UserForm.markAllAsTouched();
      return;
    } else {

 
        let bodyData:IUserSave = {
          UserId :this.dialogData?.value?.UserId? this.dialogData?.value?.UserId : 0,
          LoginUserName: this.UserForm.value.LoginUserName,
          UserFirstName: this.UserForm.value.UserFirstName,
          UserMiddleName: this.UserForm.value.UserMiddleName,
          UserLastName: this.UserForm.value.UserLastName,
          UserEmail: this.UserForm.value.UserEmail,
          ContactNo: this.UserForm.value.ContactNo,
          Password: this.UserForm.value.Password,
          UserRoleId: this.UserForm.value.UserRoleId,
          IsActive: this.UserForm.value.IsActive,
          TenantId:this.loginDetails.TenantId,
          CreatedBy:this.loginDetails.UserId,
     
       
        }
        const saveCategory = this.userService.SaveUser(bodyData).subscribe((res:any)=>{
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
