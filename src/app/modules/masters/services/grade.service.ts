import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { IsaveGrade } from '../interfaces/isave-grade';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GradeService {

  constructor(private apiService: ApiService) { }

  SaveGrade(Body:IsaveGrade): Observable<any> {
    return this.apiService.post('Master/SaveGrade', Body);
  }

}
