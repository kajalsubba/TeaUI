import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { IGetsupplierBill } from '../interfaces/isupplier-history';
import { Observable } from 'rxjs';
import { ISmartHistory } from '../interfaces/istgbill-history';

@Injectable({
  providedIn: 'root'
})
export class SuppilerHistoryService {

  constructor(private apiService: ApiService) { }

  GetSupplierBillHistory(Body:IGetsupplierBill): Observable<any> {
    return this.apiService.post('Accounts/GetSupplierBillHistory', Body);
  }

  GetSmartHistory(Body:ISmartHistory): Observable<any> {
    return this.apiService.post('Accounts/GetSmartHistory', Body);
  }
}
