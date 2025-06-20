import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { IStgVehicle, IstgApprove } from '../interfaces/istg-approve';
import { Observable } from 'rxjs';
import { IGetSale, ILaterStgEntry, IStgPendingDate, IStgSaleSave, IsaleSave } from '../interfaces/isale-save';
import { IGetSaleFactory } from '../../masters/interfaces/IFactory';

@Injectable({
  providedIn: 'root'
})
export class StgApproveService {

  constructor(private apiService: ApiService) { }

  SaveStgApprove(clientBody:IstgApprove): Observable<string[]> {
    return this.apiService.post('Collection/SaveApproveStg', clientBody);
  }


  SaveSale(clientBody:IsaleSave): Observable<string[]> {
    return this.apiService.post('Sale/SaveSale', clientBody);
  }

  GetSaleDetails(clientBody:IGetSale): Observable<string[]> {
    return this.apiService.post('Sale/GetSaleDetails', clientBody);
  }

  GetSaleFactoryDetails(clientBody:IGetSaleFactory): Observable<string[]> {
    return this.apiService.post('Sale/GetSaleFactory', clientBody);
  }

  GetSaleType(): Observable<string[]> {
    return this.apiService.get('Master/GetSaleType');
  }

  GetStgPendingDate(bodyData:IStgPendingDate): Observable<string[]> {
    return this.apiService.post('Collection/GetStgPendingDate', bodyData);
  }

  SaveStgSaleData(clientBody:IStgSaleSave): Observable<string[]> {
    return this.apiService.post('Collection/SaveStgSale', clientBody);
  }
  GetStgVehicle(clientBody:IStgVehicle): Observable<string[]> {
    return this.apiService.post('Collection/GetStgVehicleData', clientBody);
  }

  SaveLateralSTGData(clientBody:ILaterStgEntry): Observable<string[]> {
    return this.apiService.post('Collection/LateralStgSave', clientBody);
  }

  SaleStatementPrint(Body: IGetSale): Observable<any> {
    return this.apiService.postPdf('Print/SalePrint', Body);
  }
}
