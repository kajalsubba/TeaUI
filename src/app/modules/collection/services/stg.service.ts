import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { IStg } from '../interfaces/istg';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StgService {

  constructor(private apiService: ApiService) { }

  SaveStg(clientBody:IStg): Observable<string[]> {
    return this.apiService.post('Collection/SaveStg', clientBody);
  }

}
