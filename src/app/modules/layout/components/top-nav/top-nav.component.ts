import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { HelperService } from 'src/app/core/services/helper.service';
import { IGetNotifications } from '../../interfaces/iget-notifications';
import { NotificationsService } from '../../services/notifications.service';
import { NotificationDataService } from '../../services/notification-data.service';
import { Subscription } from 'rxjs';

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
  NotificationData: any[] = [];
  countOfPendingNotifications: any;
  private notificationDataSubscription!: Subscription;

  constructor(
    public helper: HelperService,
    private router: Router,
    private datePipe: DatePipe,
    //private notificationService: NotificationsService
    private notificationDataService: NotificationDataService
  ) { }

  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.updateDateTime();
    setInterval(() => {
      this.updateDateTime();
    }, 1000);

    // Subscribe to changes in notification data
    this.notificationDataSubscription = this.notificationDataService.notificationData$.subscribe((data) => {
      // Update NotificationData and countOfPendingNotifications
      this.NotificationData = data;
      this.countOfPendingNotifications = data.length;
    });

    this.GetNotificationData();
  }

  toggleSideNav(): void {
    this.switchSideNav = !this.switchSideNav;
    this.sideNavSwitch.emit(this.switchSideNav);
  }

  logout() {
    this.helper.setItem('isLoggedIn', false);
    this.helper.clear();
    this.router.navigateByUrl('login');
    sessionStorage.clear();
  }
  GetNotificationData(): void {
    const data: IGetNotifications = {
      TenantId: this.loginDetails.TenantId,
    };
    this.notificationDataService.getNotificationData(data);
  }
 
  formatCurrentRoute(): string {
    const currentRoute = this.helper.getCurrentRoute();
    const parts = currentRoute.split('/');

    // Remove the first empty string and join the rest with ' > '
    const formattedRoute = parts.slice(1).join(' > ');

    return formattedRoute.toUpperCase();
  }

  redirectToNotification(link: any) {
    this.router.navigate([`home/${link}`]);
  }
  ngOnDestroy(): void {
    // Unsubscribe to avoid memory leaks
    this.notificationDataSubscription.unsubscribe();
  }
  updateDateTime(): void {
    const now = new Date();
    this.currentDateTime = this.datePipe.transform(now, 'dd-MMM-yyyy HH:mm:ss');
  }
}
