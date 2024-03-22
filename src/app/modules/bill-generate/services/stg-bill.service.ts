import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { IGetStgBill } from '../interfaces/iget-stg-bill';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StgBillService {

  constructor(private apiService: ApiService) { }

  GetStgBill(clientBody:IGetStgBill): Observable<string[]> {
    return this.apiService.post('Accounts/GetStgBillData', clientBody);
  }
}
