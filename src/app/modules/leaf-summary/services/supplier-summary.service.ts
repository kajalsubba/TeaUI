import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { ISupplierSummary } from '../interfaces/isupplier-summary';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupplierSummaryService {

  constructor(private apiService: ApiService) { }

  GetSupplierSummary(Body:ISupplierSummary): Observable<any> {
    return this.apiService.post('Accounts/GetSupplierSummary', Body);
  }
}
