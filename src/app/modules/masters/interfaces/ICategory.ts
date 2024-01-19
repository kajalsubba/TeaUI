export interface IGetCategory {
    TenantId:number;
}

export interface ISaveCategory {
    TenantId:number;
    CreatedBy:number;
    CategoryId :number;
    CategoryName : string;
}
