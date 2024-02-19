import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { ISupplier, IUploadChallan } from '../interfaces/isupplier';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {

  constructor(private apiService: ApiService) { }

  SaveSupplier(clientBody:ISupplier): Observable<string[]> {
    return this.apiService.post('Collection/SaveSupplier', clientBody);
  }

  UploadChallan(clientBody:IUploadChallan,Files:File): Observable<any> {

    const formData = new FormData();
    formData.append('TenantId', clientBody.TenantId);
    formData.append('ChallanImage', Files);
    formData.append('CollectionId', clientBody.CollectionId);
    

     return this.apiService.postfile('Collection/UploadSupplierChallan', formData);
  }
}
