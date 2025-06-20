import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { ISaveStgRate, IStgRateFix } from '../interfaces/istg-rate-fix';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StgRateFixService {

  constructor(private apiService: ApiService) { }

  GetStgRateFixData(Body:IStgRateFix): Observable<any> {
    return this.apiService.post('Collection/GetStgRateFixData', Body);
  }

  SavetgRateFixData(Body:ISaveStgRate): Observable<any> {
    return this.apiService.post('Collection/SaveStgRate', Body);
  }

}
