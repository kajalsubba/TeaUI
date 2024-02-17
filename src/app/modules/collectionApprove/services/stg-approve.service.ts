import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { IstgApprove } from '../interfaces/istg-approve';
import { Observable } from 'rxjs';
import { IsaleSave } from '../interfaces/isale-save';

@Injectable({
  providedIn: 'root'
})
export class StgApproveService {

  constructor(private apiService: ApiService) { }

  SaveStgApprove(clientBody:IstgApprove): Observable<string[]> {
    return this.apiService.post('Collection/SaveApproveStg', clientBody);
  }


  SaveSale(clientBody:IsaleSave): Observable<string[]> {
    return this.apiService.post('Collection/SaveSale', clientBody);
  }

}
