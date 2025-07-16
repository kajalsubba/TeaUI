import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NotificationsService } from './notifications.service';
import { IGetNotifications } from '../interfaces/iget-notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationDataService {
  private _notificationData = new BehaviorSubject<any[]>([]);
  notificationData$ = this._notificationData.asObservable();
  constructor(private notificationService: NotificationsService) { }

  getNotificationData(data: IGetNotifications): void {
    this.notificationService.GetStgBillHistory(data).subscribe((res) => {
      const pendingNotifications = res.NotificationData.filter((item: any) => item.TotalPending > 0);

      this._notificationData.next(pendingNotifications);
    });
  }
}
