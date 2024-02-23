import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../../services/login.service';
import { Subscription } from 'rxjs';
import { IClientLogin, ILogin } from '../../interfaces/ilogin';
import { HelperService } from 'src/app/core/services/helper.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  ClientloginForm!:FormGroup;
  private subscription: Subscription[] = [];
  TenantList:any=[];
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

    this.ClientloginForm = this.fb.group({
      TenantId:['', Validators.required],
      userName: ['', Validators.required],
      password: ['', Validators.required],
    });
    this.GetTenant();
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
          if(res.LoginDetails.length>0){
          this.helper.setItem('loginDetails', res.LoginDetails[0]);
          this.router.navigateByUrl('home')
        }
        else
        {
          alert('Login is failed')
        }
      });
    }
  }
  GetTenant(){
  
    const dataService = this.loginService.GetTenant().subscribe((res:any)=>{
      console.log(res);
      this.TenantList= res.TenantDetails;
    });
   
  }

  onClientLogin()
  {
    if (this.ClientloginForm.invalid) {
      this.ClientloginForm.markAllAsTouched();
      return;
    } else {
      let loginBody: IClientLogin = {
        Email: this.ClientloginForm.value.userName,
        Password: this.ClientloginForm.value.password,
        TenantId:this.ClientloginForm.value.TenantId,
      };
      const login = this.loginService.Clientlogin(loginBody).subscribe((res: any) => {
          if(res.ClientLoginDetails.length>0){
          this.helper.setItem('loginDetails', res.ClientLoginDetails[0]);
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
