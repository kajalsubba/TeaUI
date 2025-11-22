import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { IFinancialYear } from '../interfaces/ICategory';

@Injectable({
  providedIn: 'root'
})
export class FinancialYearService {

  constructor(private apiService: ApiService) { }

  SaveFinancialYear(payload: IFinancialYear): Observable<any> {
    return this.apiService.post('Master/SaveFinancialYear', payload);
  }
}
