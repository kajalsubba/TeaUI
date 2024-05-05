import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HelperService } from 'src/app/core/services/helper.service';
import { UserService } from '../../services/user.service';
import { IChangePassword } from '../../interfaces/iuser';
import { Subject, catchError, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  changeForm!:FormGroup;
  passwordType: string='password';
  loginDetails: any;
  private destroy$ = new Subject<void>();
  constructor(private fb:FormBuilder,  private helper: HelperService,private passwordService:UserService,
    private toastr: ToastrService,

  ){}

  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails');
      this.changeForm = this.fb.group({
        Password:['', Validators.required],
        ConfirmPassword:['', [Validators.required, this.passwordMatchValidator.bind(this)]]
      })
  }

  togglePassword(type: string) {
    this.passwordType = type;
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    // Check if this.changeForm is defined
    if (!this.changeForm) {
      return null;
    }
  
    const password = this.changeForm.value.Password;
    const confirmPassword = control.value;
    if (password !== confirmPassword) {
      return { 'passwordMismatch': true };
    }
    return null;
  }
  

  get confirmPasswordControl() {
    return this.changeForm.value.ConfirmPassword;
  }

  onSubmit(): void {
    if (this.changeForm.invalid) {
      this.changeForm.markAllAsTouched();
      return;
    }
  
      let data: IChangePassword = {
        UserName:this.loginDetails.LoginType=='Client'? this.loginDetails.ClientId.toString():this.loginDetails.UserId.toString(),
        Password: this.changeForm.value.Password,
        LoginType:this.loginDetails.LoginType,
        TenantId: this.loginDetails.TenantId,
        CreatedBy: this.loginDetails.UserId
      };
      this.passwordService
      .ChangePassword(data)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error:', error);
          this.toastr.error('An error occurred', 'ERROR');
          throw error;
        })
      )
      .subscribe((res: any) => {

        this.toastr.success(res.Message, "SUCCESS");
        this.changeForm.reset();
      });
   
  }

}
