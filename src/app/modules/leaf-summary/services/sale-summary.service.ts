import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { ISaleSummary } from '../interfaces/isale-summary';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SaleSummaryService {

  constructor(private apiService: ApiService) { }

  GetSaleSummary(Body:ISaleSummary): Observable<any> {
    return this.apiService.post('Accounts/GetSaleSummary', Body);
  }
}
