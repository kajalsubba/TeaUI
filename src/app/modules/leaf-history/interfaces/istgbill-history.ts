export interface IstgbillHistory {
}

export interface GetstgBill {
  FromDate: string;
  ToDate: string;
  ClientId: number;
  TenantId: number;
}

export interface ISmartHistory {
  FromDate: string;
  ToDate: string;
  ClientId: number;
  TenantId: number;
  CategoryName: string;
}

export interface IPrint {
  TenantId: Number;
  BillNo: Number;
}