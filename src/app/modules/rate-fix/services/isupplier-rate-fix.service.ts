import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { ISaveSupplierRate, IsupplierRateFix } from '../interfaces/isupplier-rate-fix';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IsupplierRateFixService {

  constructor(private apiService: ApiService) { }

  GetSupplierRateFixData(Body:IsupplierRateFix): Observable<any> {
    return this.apiService.post('Collection/GetSupplierRateFixData', Body);
  }

 SaveSupplierRateFixData(Body:ISaveSupplierRate): Observable<any> {
    return this.apiService.post('Collection/SaveSupplierRate', Body);
  }


}
