import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { IstgApprove } from '../interfaces/istg-approve';
import { Observable } from 'rxjs';
import { IGetSale, IsaleSave } from '../interfaces/isale-save';

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

  GetSaleDetails(clientBody:IGetSale): Observable<string[]> {
    return this.apiService.post('Collection/GetSaleDetails', clientBody);
  }

  GetSaleType(): Observable<string[]> {
    return this.apiService.get('Master/GetSaleType');
  }

}
