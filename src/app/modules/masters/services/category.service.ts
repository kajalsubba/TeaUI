import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { IGetCategory, ISaveCategory } from '../interfaces/ICategory';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private apiService: ApiService) { }

  getCategory(Body:IGetCategory): Observable<any> {
    return this.apiService.post('Master/GetCategory', Body);
  }

  saveCategory(Body:ISaveCategory): Observable<any> {
    return this.apiService.post('Master/SaveCategory', Body);
  }

}
