import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { ICompany, IGetCompany } from '../interfaces/icompany';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  constructor(private apiService: ApiService) { }

  GetCompany(clientBody:IGetCompany): Observable<any> {
    return this.apiService.post('Master/GetCompany', clientBody);
  }

  
  SaveComapany(clientBody:ICompany): Observable<any> {
    return this.apiService.post('Master/SaveCompany', clientBody);
  }
}
