export interface IStg {
    CollectionId: any;
    CollectionDate: any;
    VehicleNo: any;
    ClientId: any;
    FirstWeight: any;
    WetLeaf: any;
    LongLeaf: any;
    Deduction: any;
    FinalWeight: any;
    Rate: any;
    GrossAmount: any;
    TripId:any;
    GradeId: any;
    Remarks: string,
    TenantId: any;
    Status: string,
    CreatedBy: any;
}

export interface IStgSelect
{
    FromDate: any;
    ToDate: any;
    TenantId: any;
    VehicleNo: any;
    Status: string;
    TripId:any;
}
