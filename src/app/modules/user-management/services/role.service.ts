import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { IGetRole, ISaveRole } from '../interfaces/irole';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  constructor(private apiService: ApiService) { }

  GetRole(Body:IGetRole): Observable<any> {
    return this.apiService.post('Admin/GetRole', Body);
  }

  GetRolePermission(Body:IGetRole): Observable<any> {
    return this.apiService.post('Admin/GetRolePermission', Body);
  }

  CreateRole(Body:ISaveRole): Observable<any> {
    return this.apiService.post('Admin/CreateRole', Body);
  }


}
