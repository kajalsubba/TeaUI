import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { IsaveClient } from '../interfaces/isave-client';
import { Observable } from 'rxjs';
import { IgetClient } from '../interfaces/iget-client';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(private apiService: ApiService) { }

  SaveClient(Body:IsaveClient): Observable<any> {
    return this.apiService.post('Master/SaveClient', Body);
  }

  GetClientList(Body:IgetClient): Observable<any> {
    return this.apiService.post('Master/GetClient', Body);
  }


}
