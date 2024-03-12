export interface ISupplier {
    CollectionId: any;
    CollectionDate: any,
    VehicleNo: any;
    ClientId: any;
    AccountId: any;
    FineLeaf: any;
    ChallanWeight: any;
    Rate: any;
    GrossAmount: any;
    TripId: any;
    Status: any;
    Remarks: any;
    TenantId: any;
    CreatedBy: 0
}

export interface IUploadChallan
{
    CollectionId: any;
    TenantId: any;
}
export interface ISupplierSelect
{
    FromDate: any;
    ToDate: any;
    TenantId: any;
    VehicleNo: any;
    Status: string;
    TripId:any;
    CreatedBy:any;
}
export interface IDefaultData
{
    CreatedBy: any;
    TenantId: any;
}