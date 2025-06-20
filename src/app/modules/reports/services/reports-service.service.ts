import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { IMonthWiseCollection, IReports, ISeasonAdvance } from '../interfaces/ireports';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportsServiceService {

  constructor(private apiService: ApiService) { }

  GetClientWiseGradeReport(Body: IReports): Observable<any> {
    return this.apiService.post('Reports/ClientWiseGradeReport', Body);
  }

  GetDateWiseGradeReport(Body: IReports): Observable<any> {
    return this.apiService.post('Reports/DateWiseGradeReport', Body);
  }

  GetPurchaseSaleReport(Body: IReports): Observable<any> {
    return this.apiService.post('Reports/PurchaseAndSaleReport', Body);
  }

  GetMonthWiseCollectionReport(Body: IMonthWiseCollection): Observable<any> {
    return this.apiService.post('Reports/MonthWiseWeightReport', Body);
  }

  GetSalePurchaseWiseReport(Body: IReports): Observable<any> {
    return this.apiService.post('Reports/SalePurchaseWiseReport', Body);
  }
  GetSeasonAdvanceReport(Body: ISeasonAdvance): Observable<any> {
    return this.apiService.post('Reports/GetSeasonAdvanceReport', Body);
  }
    GetFieldBalanceReport(Body: ISeasonAdvance): Observable<any> {
    return this.apiService.post('Reports/GetFieldBalanceReport', Body);
  }
}
