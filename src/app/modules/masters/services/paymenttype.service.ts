import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { IGetPaymentType, IPaymentType } from '../interfaces/ipayment-type';

@Injectable({
  providedIn: 'root'
})
export class PaymenttypeService {

  constructor(private apiService: ApiService) { }

  GetPaymentType(body:IGetPaymentType): Observable<any> {
    return this.apiService.post('Master/GetPaymentType', body);
  }

  SavePaymentType(body:IPaymentType): Observable<any> {
    return this.apiService.post('Master/SavePaymentType', body);
  }
}
