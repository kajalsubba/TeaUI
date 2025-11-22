import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { RecoveryFilterRequest, SaveRecoveryModel } from '../interfaces/irecovery';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecoveryService {

  constructor(private apiService: ApiService) { }

  SaveRecovery(clientBody: SaveRecoveryModel): Observable<string[]> {
    return this.apiService.post('Accounts/SaveRecovery', clientBody);
  }

  GetRecovery(clientBody: RecoveryFilterRequest): Observable<any> {
    return this.apiService.post('Accounts/GetRecovery', clientBody);
  }

}
