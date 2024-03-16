import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { IGetPayment, ISavePayment } from '../interfaces/ipayment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(private apiService: ApiService) { }

  GetPaymentData(clientBody:IGetPayment): Observable<string[]> {
    return this.apiService.post('Accounts/GetPaymentData', clientBody);
  }

  SavePaymentData(clientBody:ISavePayment): Observable<string[]> {
    return this.apiService.post('Accounts/SavePayment', clientBody);
  }
}
