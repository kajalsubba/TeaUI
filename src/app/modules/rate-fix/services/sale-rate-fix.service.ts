import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { ISaveSaleRate, IsaleRateFix } from '../interfaces/isale-rate-fix';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SaleRateFixService {

  constructor(private apiService: ApiService) { }

  GetSaleRateFixData(Body:IsaleRateFix): Observable<any> {
    return this.apiService.post('Sale/GetSaleRateFixData', Body);
  }

  
  SaveSaleRateFixData(Body:ISaveSaleRate): Observable<any> {
    return this.apiService.post('Sale/SaveSaleRate', Body);
  }
}
