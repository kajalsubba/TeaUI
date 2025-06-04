import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { IGetWalletHistory, ISaveWallet, IWalletBalance } from '../interfaces/iwallet';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  constructor(private apiService: ApiService) { }

  SaveUserWallet(clientBody: ISaveWallet): Observable<string[]> {
    return this.apiService.post('Accounts/SaveUserWallet', clientBody);
  }

  GetWalletHistory(clientBody: IGetWalletHistory): Observable<any> {
    return this.apiService.post('Accounts/GetWalletHistory', clientBody);
  }
  GetWalletBalanceData(clientBody: IWalletBalance): Observable<any> {
    return this.apiService.post('Accounts/GetWalletBalanace', clientBody);
  }
  GetWalletStatement(clientBody: IGetWalletHistory): Observable<any> {
    return this.apiService.post('Accounts/GetWalletStatement', clientBody);
  }
}
