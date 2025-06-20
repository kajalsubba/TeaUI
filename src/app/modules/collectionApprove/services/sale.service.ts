import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { IDirectSale } from '../interfaces/isale-save';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SaleService {

  constructor(private apiService: ApiService) { }

  SaveDirectSale(clientBody:IDirectSale): Observable<string[]> {
    return this.apiService.post('Sale/SaveSale', clientBody);
  }

}
