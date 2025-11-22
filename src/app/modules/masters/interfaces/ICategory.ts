export interface IGetCategory {
    TenantId: number;
}

export interface IDeleteCategory {
    CategoryId: number;
}

export interface ISaveCategory {
    TenantId: number;
    CreatedBy: number;
    CategoryId: number;
    CategoryName: string;
}

export interface ITargetModel {
    TargetId: number;
    ClientId: number;
    FinancialYearId: number;
    TargetWeight: number;
    TenantId: number;
    CreatedBy: number;
}

export interface IFinancialYear {
  FinancialYearId?: number | null;
  FinancialYear?: number | null;
  TenantId?: number | null;
  CreatedBy?: number | null;
}