import { Component, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent {
  isExpanded: boolean = false;
  panelOpenState = false;
  currentOpenMenu: string | null = null;


  toggleWidth() {
    this.isExpanded = !this.isExpanded;
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
