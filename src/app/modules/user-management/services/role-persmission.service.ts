import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { ISaveRolePermission } from '../interfaces/irole-permission';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolePersmissionService {

  constructor(private apiService: ApiService) { }

  SaveRolePermission(Body:ISaveRolePermission): Observable<any> {
    return this.apiService.post('Admin/SaveRolePermission', Body);
  }

}
