import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HelperService } from 'src/app/core/services/helper.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn: any = false;

  constructor(
    private helper: HelperService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.isLoggedIn = this.helper.getItem('isLoggedIn');
  }

  login() {
    // Your login logic here
    this.isLoggedIn = true;
    this.helper.setItem('isLoggedIn', true);
  }

  logout() {
    // Your logout logic here
    this.isLoggedIn = false;
    this.helper.removeItem('isLoggedIn');
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    } else {
      this.toastr.error('Please Login!');
      this.router.navigate(['']);
      return false;
    }
  }
}
