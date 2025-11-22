import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { ITargetModel } from '../interfaces/ICategory';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TargetcollectionService {

  constructor(private apiService: ApiService) { }

    SaveSupplierTarget(body:ITargetModel): Observable<any> {
      return this.apiService.post('Master/SaveSupplierTarget', body);
    }
}
