import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  changeForm!:FormGroup;
  passwordType: string='password';

  constructor(private fb:FormBuilder){}

  ngOnInit(): void {
      this.changeForm = this.fb.group({
        Password:['', Validators.required],
        ConfirmPassword:['', [Validators.required, this.passwordMatchValidator.bind(this)]]
      })
  }

  togglePassword(type: string) {
    this.passwordType = type;
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = this.changeForm.controls['Password'].value;
    const confirmPassword = control.value;
    if (password !== confirmPassword) {
      return { 'passwordMismatch': true };
    }
    return null;
  }

  get confirmPasswordControl() {
    return this.changeForm.get('ConfirmPassword');
  }

  onSubmit(): void {
    if (this.changeForm.valid) {
      // Proceed with form submission
      console.log("Form submitted successfully!");
    } else {
      // Form is invalid, handle accordingly
      console.log("Form is invalid!");
    }
  }

}
