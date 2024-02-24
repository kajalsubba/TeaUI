import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { IstgApprove } from '../interfaces/istg-approve';
import { Observable } from 'rxjs';
import { IsupplierApprove } from '../interfaces/isupplier-approve';

@Injectable({
  providedIn: 'root'
})
export class SupplierapproveService {

  constructor(private apiService: ApiService) { }

  SaveSupplierApprove(clientBody:IsupplierApprove): Observable<string[]> {
    return this.apiService.post('Collection/SaveApproveSupplier', clientBody);
  }

}
