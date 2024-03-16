import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { HelperService } from 'src/app/core/services/helper.service';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss'],
})
export class TopNavComponent implements OnInit {
  showDropdown: boolean = false;
  switchSideNav: boolean = false;
  @Output() sideNavSwitch = new EventEmitter<any>();
  loginDetails: any;
  currentDateTime: string | null = null; 

  constructor(public helper: HelperService, private router: Router, private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.updateDateTime();
    setInterval(() => {
      this.updateDateTime();
    }, 1000);
  }

  toggleSideNav(): void {
    this.switchSideNav = !this.switchSideNav;
    this.sideNavSwitch.emit(this.switchSideNav);
  }

  logout() {
    this.helper.setItem('isLoggedIn', false);
    this.helper.clear();
    this.router.navigateByUrl('login');
  }

  formatCurrentRoute(): string {
    const currentRoute = this.helper.getCurrentRoute();
    const parts = currentRoute.split('/');

    // Remove the first empty string and join the rest with ' > '
    const formattedRoute = parts.slice(1).join(' > ');

    return formattedRoute.toUpperCase();
  }

  updateDateTime(): void {
    const now = new Date();
    this.currentDateTime = this.datePipe.transform(now, 'dd-MMM-yyyy HH:mm:ss');
  }
}
