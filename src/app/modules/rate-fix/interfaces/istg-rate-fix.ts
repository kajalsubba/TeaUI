export interface IStgRateFix {
  FromDate: string;
  ToDate: string;
  TenantId: number;
  ClientId: number;
  GradeId: number;
}

export interface ISaveStgRate
{
    RateData:IRateList[];
    TenantId: any;
    CreatedBy: any;
}
export interface IRateList
{
    CollectionId: any;
    Rate: any;

}

