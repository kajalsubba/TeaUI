import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, Subject, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { UserService } from 'src/app/modules/user-management/services/user.service';
import { IClientChangePassword } from '../../interfaces/IClient';

@Component({
  selector: 'app-client-password-change',
  templateUrl: './client-password-change.component.html',
  styleUrls: ['./client-password-change.component.scss']
})
export class ClientPasswordChangeComponent implements OnInit {

  changeForm!:FormGroup;
  passwordType: string='password';
  loginDetails: any;
  private destroy$ = new Subject<void>();
  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<ClientPasswordChangeComponent>,
    private fb:FormBuilder,  
    private helper: HelperService,
    private passwordService:UserService,
    private toastr: ToastrService,
    private router: Router

  ){}

  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails');
      this.changeForm = this.fb.group({
        ClientId:[''],
        Password:['', Validators.required],
        ConfirmPassword:['', [Validators.required, this.passwordMatchValidator.bind(this)]]
      })

      if (this.dialogData.value) {

        this.changeForm.controls['ClientId'].setValue(this.dialogData.value.ClientId);
       
      }    
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
  
      let data: IClientChangePassword = {
        ClientId:this.changeForm.value.ClientId,
        Password: this.changeForm.value.Password,
        TenantId: this.loginDetails.TenantId,
        CreatedBy: this.loginDetails.UserId
      };
      this.passwordService
      .ClientChangePasswordByAdmin(data)
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
        this.dialogRef.close(true);
        this.changeForm.reset();
        // this.helper.setItem('isLoggedIn', false);
        // this.helper.clear();
        // this.router.navigateByUrl('login');
        // sessionStorage.clear();
      });
   
  }

}
