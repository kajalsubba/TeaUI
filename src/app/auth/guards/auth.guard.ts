// auth.guard.ts

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HelperService } from 'src/app/core/services/helper.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {

    isLoggedIn:any=false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private helper: HelperService,
    private toastr: ToastrService
  ) {
    this.isLoggedIn = this.helper.getItem('isLoggedIn')
  }

  canActivate(): boolean {
    if (this.isLoggedIn) {
      return true;
    } else {
      this.toastr.error('Please Login!')
      this.router.navigate(['']);
      return false;
    }
  }
}
