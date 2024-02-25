export interface ISaveClient {
  ClientId: number;
  ClientFirstName: string;
  ClientMiddleName: string;
  ClientLastName: string;
  ClientAddress: string;
  Password:any;
  ContactNo: string;
  EmailId: string;
  CategoryID: number;
  TenantId: number;
  IsActive: boolean;
  CreatedBy: number;
}

export interface IGetClient {
  TenantId:number;
  Category:string;
}

