import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AutoCompleteService {

  constructor() { }

  getVehicleNumbers(): Observable<string[]> {
    // Replace this with your actual data fetching logic
    const vehicleNumbers: string[] = ['AS019124', 'AS015678', 'AS011234'];
    return of(vehicleNumbers);
  }

  getClientNames(): Observable<string[]> {
    // Replace this with your actual data fetching logic
    const clientName: string[] = ['Kajal Subba', 'Akshar Patel', 'Hari Prasad'];
    return of(clientName);
  }

}
