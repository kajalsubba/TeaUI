import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { ICollectionRateFixFilter, IDeleteGrade, IGetGrade, ISaveGrade } from '../interfaces/IGrade';

@Injectable({
  providedIn: 'root'
})
export class GradeService {

  constructor(private apiService: ApiService) { }

  GetGrade(gradeBody:IGetGrade): Observable<any> {
    return this.apiService.post('Master/GetGrade', gradeBody);
  }

  SaveGrade(gradeBody:ISaveGrade): Observable<any> {
    return this.apiService.post('Master/SaveGrade', gradeBody);
  }

  DeleteGrade(gradeBody:IDeleteGrade): Observable<any> {
    return this.apiService.post('Master/DeleteGrade', gradeBody);
  }

   GetCollectionRateFixGrade(gradeBody:ICollectionRateFixFilter): Observable<any> {
    return this.apiService.post('Collection/GetStgRateFixGradeData', gradeBody);
  }

}
