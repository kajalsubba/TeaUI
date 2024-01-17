import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { HelperService } from 'src/app/core/services/helper.service';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss']
})
export class TopNavComponent implements OnInit {
  showDropdown: boolean = false;
  switchSideNav:boolean = false;
  @Output() sideNavSwitch = new EventEmitter<any>();
  loginDetails: any;

  constructor(private helper:HelperService, private router:Router){}

  ngOnInit(): void {
      this.loginDetails = this.helper.getItem('loginDetails')
  }

  toggleSideNav():void{
    this.switchSideNav = !this.switchSideNav;
    this.sideNavSwitch.emit(this.switchSideNav);
  }

  logout(){
    this.helper.clear();
    this.router.navigateByUrl('login')
  }
}
