export interface ISaveFactoryAccount {
  AccountId: number;
  AccountName: string;
  FactoryId: number;
  TenantId: number;
  BioMatrixNo: string;
  IsActive: boolean;
  CreatedBy: number;
}

export interface IGetFactoryAccount {
  TenantId: number;
}
