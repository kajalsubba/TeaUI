import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { ISaleStg } from '../interfaces/isale-stg';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SaleService {

  constructor(private apiService: ApiService) { }

  GetSaleStgData(Body:ISaleStg): Observable<any> {
    return this.apiService.post('Sale/GetSaleStgData', Body);
  }

  GetSaleSupplierData(Body:ISaleStg): Observable<any> {
    return this.apiService.post('Sale/GetSaleSupplierData', Body);
  }
}
