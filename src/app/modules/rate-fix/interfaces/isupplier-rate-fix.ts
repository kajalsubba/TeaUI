export interface IsupplierRateFix {

    FromDate: string;
    ToDate: string;
    FactoryId: number;
    AccountId: number;
    ClientId: number;
    FineLeaf:string;
    TenantId: number;
}

export interface ISaveSupplierRate {
    RateData: IRateList[];
    TenantId: any;
    CreatedBy: any;
}
export interface IRateList {
    CollectionId: any;
    Rate: any;

}
