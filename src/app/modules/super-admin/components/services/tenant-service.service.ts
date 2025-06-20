import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { ITenantSave } from '../interfaces/itenant';

@Injectable({
  providedIn: 'root'
})
export class TenantServiceService {

  constructor(private apiService: ApiService) { }

  GetTeanat(): Observable<any> {
    return this.apiService.get('Admin/GetTenant');
  }
  SaveTenant(clientBody:ITenantSave): Observable<any> {
    return this.apiService.post('Admin/Savetenant', clientBody);
  }
}
