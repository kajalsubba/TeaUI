import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { IGetClient } from '../interfaces/IClient';
import { ISaveCategory } from '../interfaces/ICategory';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(private apiService: ApiService) { }

  getClient(clientBody:IGetClient): Observable<any> {
    return this.apiService.post('Master/GetClient', clientBody);
  }

  saveClient(clientBody:ISaveCategory): Observable<any> {
    return this.apiService.post('Master/SaveClient', clientBody);
  }
}
