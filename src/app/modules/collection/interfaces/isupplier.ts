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

export interface IUploadChallan {
    CollectionId: any;
    TenantId: any;
}
export interface ISupplierSelect {
    FromDate: any;
    ToDate: any;
    TenantId: any;
    VehicleNo: any;
    Status: string;
    ClientId: Number;
    TripId: any;
    FactoryId: Number;
    CreatedBy: any;
}

export interface ISupplierHistory {
    FromDate: any;
    ToDate: any;
    TenantId: any;
    Status: string;
    ClientId: Number;
    FactoryId: Number;
    AccountId: any;
    FineLeaf: string;
    CreatedBy: any;
}
export interface IDefaultData {
    CreatedBy: any;
    TenantId: any;
}