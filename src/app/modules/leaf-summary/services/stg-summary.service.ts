import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { IStgSummary } from '../interfaces/istg-summary';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StgSummaryService {

  constructor(private apiService: ApiService) { }

  GetStgSummary(Body:IStgSummary): Observable<any> {
    return this.apiService.post('Accounts/GetStgSummary', Body);
  }

}
