import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HelperService } from 'src/app/core/services/helper.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  changeForm!:FormGroup;
  passwordType: string='password';
  loginDetails: any;
  constructor(private fb:FormBuilder,  private helper: HelperService){}

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
    if (this.changeForm.valid) {
      // Proceed with form submission
      console.log("Form submitted successfully!");

      if (this.loginDetails.LoginType == 'Client')
      {

      }
      else
      {

      }
    } else {
      // Form is invalid, handle accordingly
      this.changeForm.markAllAsTouched()
      console.log("Form is invalid!");
    }
  }

}
