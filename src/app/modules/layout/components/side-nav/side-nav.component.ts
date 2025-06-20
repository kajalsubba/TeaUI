import { Component, HostListener, Input, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { HelperService } from 'src/app/core/services/helper.service';
import { IModulePermissions } from '../../interfaces/iget-notifications';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent {
  isExpanded: boolean = false;
  isDesktop: boolean = true;
  panelOpenState = false;
  currentOpenMenu: string | null = null;
  loginDetails: any;
  PermissionDetails:any;
  /**
   *
   */
  constructor(public helper: HelperService, private router: Router) {
    this.isDesktop = window.innerWidth > 768;
  }

  ngOnInit(): void {
    debugger
    if (this.helper.getItem('loginDetails') != null) {
      this.loginDetails = this.helper.getItem('loginDetails');
      this.PermissionDetails = this.helper.getItem('PermissionDetails');
       
      
    }
    else {
      this.router.navigateByUrl('login');
    }


  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isDesktop = event.target.innerWidth > 768; // Update isDesktop flag on window resize
  }

  onMouseEnter() {
    this.isExpanded = true;
  }

  onMouseLeave() {
    this.isExpanded = false;
  }



  toggleWidth() {
    this.isExpanded ? false : true;
  }

  toggleMenu(event: MouseEvent, menuIdentifier: string): void {
    const arrowParent = (event.target as HTMLElement).closest('.main-menu') as HTMLElement;
    if (arrowParent) {
      if (this.currentOpenMenu === menuIdentifier) {
        // If the clicked menu is already open, close it
        this.currentOpenMenu = null;
      } else {
        // If the clicked menu is closed, open it
        this.currentOpenMenu = menuIdentifier;
      }
    }
  }


}
