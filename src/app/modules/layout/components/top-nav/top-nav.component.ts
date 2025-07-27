import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { HelperService } from 'src/app/core/services/helper.service';
import { IGetNotifications, IRenewNotification } from '../../interfaces/iget-notifications';
import { NotificationsService } from '../../services/notifications.service';
import { NotificationDataService } from '../../services/notification-data.service';
import { Subscription } from 'rxjs';
import { SignalRService } from '../../services/signal-r.service';

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
  NotificationStatus!: String;
  DaysRemaining!: String;
  DisplayMessage!: string;
  ProductStatus!: string;
  ExpireDate: any;
  private notificationDataSubscription!: Subscription;

  constructor(
    public helper: HelperService,
    private router: Router,
    private datePipe: DatePipe,
    private signalRService: SignalRService,
    private notificationDataService: NotificationDataService,
    private notificationsService: NotificationsService
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

    this.signalRService.messages$.subscribe(data => {
      // Handle the received message
      //   this.GetNotificationData();
      if (data.tenantId == this.loginDetails.TenantId) {
        console.log(`Received in component: ${data.message}, TenantId: ${data.tenantId}`);

        this.notificationDataSubscription = this.notificationDataService.notificationData$.subscribe((data) => {
          // Update NotificationData and countOfPendingNotifications
          this.NotificationData = data;
          this.countOfPendingNotifications = data.length;
        });

      }

    });

    this.GetNotificationData();
    this.GetRenewNotification();
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
    // const currentRoute = this.helper.getCurrentRoute();
    // const parts = currentRoute.split('/');
    // const formattedRoute = parts.slice(1).join(' > ');
    // return formattedRoute.toUpperCase();
    let currentRoute = this.helper.getCurrentRoute();

    // Remove query params and fragment if any
    currentRoute = currentRoute.split('?')[0].split('#')[0];
    const parts = currentRoute.split('/');
    // Remove leading empty part (due to initial '/'), then join
    const formattedRoute = parts.slice(1).join(' > ');
    return formattedRoute.toUpperCase();
  }

  redirectToNotification(link: any, moduleId: any, minDate: any, displayName: any) {
    //this.router.navigate([`home/${link}`]);
    this.router.navigate([`home/${link}`], {
      queryParams: {
        moduleId,
        minDate,
        displayName
      }
    });
  }
  ngOnDestroy(): void {
    // Unsubscribe to avoid memory leaks
    this.notificationDataSubscription.unsubscribe();
  }
  updateDateTime(): void {
    const now = new Date();
    this.currentDateTime = this.datePipe.transform(now, 'dd-MMM-yyyy HH:mm:ss');
  }


  GetRenewNotification() {
    const bodyData: IRenewNotification = {
      TenantId: this.loginDetails.TenantId,

    }
    debugger
    const categoryListService = this.notificationsService.GetRenewNotification(bodyData).subscribe((res: any) => {

      this.ProductStatus = res.RenewInfo[0].RenewStatus;
      this.ExpireDate = res.RenewInfo[0].ExpirayDate;
      this.NotificationStatus = res.RenewInfo[0].Notify;
      this.DisplayMessage = res.RenewInfo[0].DisplayMessage;
      if (this.ProductStatus == 'Expired') {
        this.helper.setItem('Expired', this.ProductStatus);
        this.router.navigateByUrl('login');
      }
    });
  }

}
