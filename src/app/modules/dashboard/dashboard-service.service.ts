import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { Idashboard } from './idashboard';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardServiceService {

  constructor(private apiService: ApiService) { }

  GetCompanyWiseChart(Body:Idashboard): Observable<any> {
    return this.apiService.post('Admin/GetComapanyWiseSaleChart', Body);
  }
  GetSTGWiseChart(Body:Idashboard): Observable<any> {
    return this.apiService.post('Admin/GetSTGWiseSaleChart', Body);
  }
  GetSupplierWiseChart(Body:Idashboard): Observable<any> {
    return this.apiService.post('Admin/GetSupplierWiseSaleChart', Body);
  }
}
