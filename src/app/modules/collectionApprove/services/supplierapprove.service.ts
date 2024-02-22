import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { IstgApprove } from '../interfaces/istg-approve';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupplierapproveService {

  constructor(private apiService: ApiService) { }

  SaveSupplierApprove(clientBody:IstgApprove): Observable<string[]> {
    return this.apiService.post('Collection/SaveApproveSupplier', clientBody);
  }

}
