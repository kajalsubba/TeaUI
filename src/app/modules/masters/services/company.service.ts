import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { ICompany, IGetCompany } from '../interfaces/icompany';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  constructor(private apiService: ApiService,private http: HttpClient) { }

  GetCompany(clientBody:IGetCompany): Observable<any> {
    return this.apiService.post('Master/GetCompany', clientBody);
  }

  
  SaveComapany(clientBody:ICompany,Files:File): Observable<any> {

    const formData = new FormData();
    formData.append('Image', Files);
    formData.append('CompanyId', clientBody.CompanyId);
    formData.append('CompanyName', clientBody.CompanyName);
    formData.append('CompanyLogo', clientBody.CompanyLogo);
    formData.append('UserEmail', clientBody.UserEmail);
    formData.append('ContactNo', clientBody.ContactNo);
    formData.append('CompanyDetails', clientBody.CompanyDetails);
    formData.append('TenantId', clientBody.TenantId);
    formData.append('CreatedBy', clientBody.CreatedBy);

     return this.apiService.postfile('Master/SaveCompany', formData);
  }
}
