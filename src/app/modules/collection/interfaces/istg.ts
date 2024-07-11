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

export interface ILaterStg {
    CollectionId: any;
    CollectionDate: any;
    ApproveId:any;
    VehicleNo: any;
    ClientId: any;
    ClientName:string;
    FirstWeight: any;
    WetLeaf: any;
    WetLeafKg:number;
    LongLeaf: any;
    LongLeafKg:number;
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
    TenantId: number;
    VehicleNo: any;
    Status: string;
    TripId:number;
    GradeId:number;
    ClientId:number;
    CreatedBy:number;
}

export interface IGetTeaClient {
    TenantId: number;
    Category:any;
  }
