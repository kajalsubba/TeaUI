import { Component, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent {
  isExpanded: boolean = false;
  panelOpenState = false;

  toggleWidth() {
    this.isExpanded = !this.isExpanded;
  }

  toggleMenu(event: MouseEvent): void {
    const arrowParent = (event.target as HTMLElement).closest('.main-menu');
    if (arrowParent) {
      arrowParent.classList.toggle('showMenu');
    }
  }
  
}
