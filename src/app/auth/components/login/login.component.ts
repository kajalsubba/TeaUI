import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../../services/login.service';
import { Subscription } from 'rxjs';
import { ILogin } from '../../interfaces/ilogin';
import { HelperService } from 'src/app/core/services/helper.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  private subscription: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private helper: HelperService,
    private router:Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onLogin() {
    //console.log(this.loginForm);
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    } else {
      let loginBody: ILogin = {
        UserName: this.loginForm.value.userName,
        Password: this.loginForm.value.password,
      };
      const login = this.loginService.login(loginBody).subscribe((res: any) => {
          if(res.length>0){
          this.helper.setItem('loginDetails', res[0]);
          this.router.navigateByUrl('home')
        }
        else
        {
          alert('Login is failed')
        }
      });
    }
  }
}
