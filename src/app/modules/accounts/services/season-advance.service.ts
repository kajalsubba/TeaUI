import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { IGetseasonAdvance, ISaveSeasonAdvance } from '../interfaces/iseason-advance';

@Injectable({
  providedIn: 'root'
})
export class SeasonAdvanceService {

  constructor(private apiService: ApiService) { }

  GetSeasonAdvance(clientBody:IGetseasonAdvance): Observable<string[]> {
    return this.apiService.post('Accounts/GetSeasonAdvance', clientBody);
  }

  SaveSeasonAdvance(clientBody:ISaveSeasonAdvance): Observable<string[]> {
    return this.apiService.post('Accounts/SaveSeasonAdvance', clientBody);
  }
}
