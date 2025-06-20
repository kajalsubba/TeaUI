import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { IGetFactory, ISaveFactory } from '../interfaces/IFactory';

@Injectable({
  providedIn: 'root'
})
export class FactoryService {

  constructor(private apiService: ApiService) { }

  GetFactory(factoryBody:IGetFactory): Observable<any> {
    return this.apiService.post('Master/GetFactory', factoryBody);
  }

  SaveFactory(factoryBody:ISaveFactory): Observable<any> {
    return this.apiService.post('Master/SaveFactory', factoryBody);
  }
}
