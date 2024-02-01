import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IGetGrade } from '../../masters/interfaces/IGrade';
import { ApiService } from 'src/app/core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class AutoCompleteService {

  constructor(private apiService: ApiService) { }

  GetVehicleNumbers(clientBody:IGetGrade): Observable<string[]> {
    return this.apiService.post('Master/GetVehicle', clientBody);
  }

  // getClientNames(): Observable<string[]> {
  //   // Replace this with your actual data fetching logic
  //   const clientName: string[] = ['Kajal Subba', 'Akshar Patel', 'Hari Prasad'];
  //   return of(clientName);
  // }

  GetClientNames(clientBody:IGetGrade): Observable<string[]> {
    return this.apiService.post('Master/GetClientList', clientBody);
  }

  // getClient(clientBody:IGetClient): Observable<any> {
  //   return this.apiService.post('Master/GetClient', clientBody);
  // }


}
