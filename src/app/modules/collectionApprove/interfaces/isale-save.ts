export interface IsaleSave {

    SaleId: any; 
    ApproveId: any; 
    SaleDate: any; 
    AccountId: any; 
    VehicleId: any; 
    FieldCollectionWeight: any; 
    FineLeaf: any; 
    ChallanWeight: any; 
    Rate: any; 
    Incentive: any; 
    GrossAmount: any; 
    Remarks: any; 
    SaleTypeId: any; 
    DirectSale:any;
    TenantId: any; 
    CreatedBy: any; 
}

export interface IGetSale
{
    FromDate:any;
    ToDate:any;
    VehicleNo: any;
    FactoryId: any;
    AccountId:any;
    SaleTypeId: any;
    TenantId:any;
}

export interface IStgSaleSave
{
    TotalFirstWeight: any;
    TotalWetLeaf: any;
    TotalLongLeaf:any;
    TotalDeduction:any;
    TotalFinalWeight: any;
    SaleDate: any; 
    AccountId: any; 
    VehicleId: any; 
    FieldCollectionWeight: any; 
    FineLeaf: any; 
    ChallanWeight: any; 
    Rate: any; 
    Incentive: any; 
    GrossAmount: any; 
    Remarks: any; 
    SaleTypeId: any;

    TenantId: any;
    CreatedBy: any;
    ApproveList:ICollectionList[]
}

export interface ICollectionList
{
    IsApprove: boolean;
    CollectionId: any;
    Status:any;
}

