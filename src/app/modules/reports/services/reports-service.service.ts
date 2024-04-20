import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { IReports } from '../interfaces/ireports';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportsServiceService {

  constructor(private apiService: ApiService) { }

  GetClientGradeReport(Body:IReports): Observable<any> {
    return this.apiService.post('Reports/GradeReport', Body);
  }
}
