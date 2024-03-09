export interface IsaleRateFix {

    FromDate: string;
  ToDate: string;
  FactoryId: any;
  AccountId: any;
  FineLeaf: string;
  TenantId: number;
}

export interface ISaveSaleRate
{
    RateData:ISaleRateList[];
    TenantId: any;
    CreatedBy: any;
}
export interface ISaleRateList
{
    SaleId: any;
    Rate: any;
    Incentive:any;

}


