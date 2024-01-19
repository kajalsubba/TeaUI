import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { IGetGrade, ISaveGrade } from '../interfaces/IGrade';

@Injectable({
  providedIn: 'root'
})
export class GradeService {

  constructor(private apiService: ApiService) { }

  getCategory(gradeBody:IGetGrade): Observable<any> {
    return this.apiService.post('Master/GetGrade', gradeBody);
  }

  saveCategory(gradeBody:ISaveGrade): Observable<any> {
    return this.apiService.post('Master/SaveGrade', gradeBody);
  }
}
