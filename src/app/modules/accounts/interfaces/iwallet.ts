export interface ISaveWallet {

  WalletId: number;
  UserId: number;
  PaymentDate: string;
  Amount: number;
  Narration: string;
  TenantId: number;
  CreatedBy: number;
}

export interface IGetWalletHistory {
  TenantId?: number;
  FromDate?: string;  // ISO date string or any date format you're using
  ToDate?: string;
  UserId?: number;
  CreatedBy?: number;
}

export interface IWalletBalance {
  TenantId?: number;
  UserId?: number;

}

export interface IPettyCashBook {
  CashBookId?: number;
  PaymentDate?: string;
  PaymentTypeId?: number;
  Amount?: number;
  UserId?: number;
  Narration?: string;
  TenantId?: number;
  CreatedBy?: number;
}
