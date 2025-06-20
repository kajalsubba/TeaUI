import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { GetstgBill, IPrint } from '../interfaces/istgbill-history';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StgBillService {

  constructor(private apiService: ApiService) { }

  GetStgBillHistory(Body:GetstgBill): Observable<any> {
    return this.apiService.post('Accounts/GetStgBillHistory', Body);
  }

  PrintBill(Body:IPrint): Observable<any> {
    return this.apiService.postPdf('Print/StgBillPrint', Body);
  }
}
