export interface ISaveFactory {
  FactoryId: number;
  FactoryName: string;
  FactoryAddress: string;
  ContactNo: string;
  EmailId: string;
  TenantId: number;
  IsActive: boolean;
  IsClientView: boolean;
  CreatedBy: number;
}

export interface IGetFactory {
  TenantId: number;
  IsClientView: boolean;
}
export interface IGetSaleFactory {
  FromDate: String;
  ToDate: String;
  TenantId: number;
}
