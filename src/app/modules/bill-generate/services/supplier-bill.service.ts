import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { IgetSupplierBill, SaveSupplierBill } from '../interfaces/iget-supplier-bill';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupplierBillService {

  constructor(private apiService: ApiService) { }

  GetSupplierBill(clientBody:IgetSupplierBill): Observable<string[]> {
    return this.apiService.post('Accounts/GetSupplierBillData', clientBody);
  }

  SaveSupplierBIll(clientBody:SaveSupplierBill): Observable<string[]> {
    return this.apiService.post('Accounts/GetSupplierBillHistory', clientBody);
  }
}
