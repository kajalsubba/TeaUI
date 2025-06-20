import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { IGetFactoryAccount, ISaveFactoryAccount } from '../interfaces/IFactoryAccount';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FactoryAccountService {

  constructor(private apiService: ApiService) { }

  GetFactoryAccount(factoryAccountBody:IGetFactoryAccount): Observable<any> {
    return this.apiService.post('Master/GetFactoryAccount', factoryAccountBody);
  }

  SaveFactoryAccount(factoryAccountBody:ISaveFactoryAccount): Observable<any> {
    return this.apiService.post('Master/SaveFactoryAccount', factoryAccountBody);
  }
}
