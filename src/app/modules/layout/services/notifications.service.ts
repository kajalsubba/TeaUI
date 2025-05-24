import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { IGetNotifications, IRenewNotification } from '../interfaces/iget-notifications';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(private apiService: ApiService) { }

  GetStgBillHistory(Body: IGetNotifications): Observable<any> {
    return this.apiService.post('Collection/GetNotifications', Body);
  }
  GetRenewNotification(Body: IRenewNotification): Observable<any> {
    return this.apiService.post('Admin/CheckRenewDate', Body);
  }
}
