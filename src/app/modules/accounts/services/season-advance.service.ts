import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { IGetseasonAdvance } from '../interfaces/iseason-advance';

@Injectable({
  providedIn: 'root'
})
export class SeasonAdvanceService {

  constructor(private apiService: ApiService) { }

  GetSeasonAdvance(clientBody:IGetseasonAdvance): Observable<string[]> {
    return this.apiService.post('Accounts/GetSeasonAdvance', clientBody);
  }
}
