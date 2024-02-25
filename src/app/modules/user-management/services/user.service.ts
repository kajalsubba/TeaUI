import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { IGetUser, IUserSave } from '../interfaces/iuser';
import { Observable } from 'rxjs';

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
}
