import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { IClientLogin, ILogin } from '../interfaces/ilogin';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private apiService: ApiService) { }

  login(loginBody:ILogin): Observable<any> {
    return this.apiService.post('Admin/Login', loginBody);
  }

  GetTenant(): Observable<any> {
    return this.apiService.get('Admin/GetTenant');
  }

  Clientlogin(loginBody:IClientLogin): Observable<any> {
    return this.apiService.post('Admin/ClientLogin', loginBody);
  }
  

}
