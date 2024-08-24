import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { IStgBag } from '../interfaces/istg-bag';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StgBagService {

  constructor(private apiService: ApiService) { }

  GetStgBagData(Body:IStgBag): Observable<any> {
    return this.apiService.post('Collection/GetStgBagData', Body);
  }
}
