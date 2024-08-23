import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { IChangePassword, IGetUser, IUserSave } from '../interfaces/iuser';
import { Observable } from 'rxjs';
import { IClientChangePassword } from '../../masters/interfaces/IClient';
import { IpasswordChange } from '../interfaces/ipassword-change';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private apiService: ApiService) { }

  SaveUser(clientBody:IUserSave): Observable<any> {
    return this.apiService.post('Admin/SaveUser', clientBody);
  }
  GetUser(clientBody:IGetUser): Observable<any> {
    return this.apiService.post('Admin/GetUser', clientBody);
  }

  ChangePassword(clientBody:IChangePassword): Observable<any> {
    return this.apiService.post('Admin/ChangePassword', clientBody);
  }

  ClientChangePasswordByAdmin(clientBody:IClientChangePassword): Observable<any> {
    return this.apiService.post('Master/UpdateClientPassword', clientBody);
  }

  ChangeUserPassword(clientBody:IpasswordChange): Observable<any> {
    return this.apiService.post('Admin/ChangeUserPassword', clientBody);
  }
}
