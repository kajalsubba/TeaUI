export interface IReports {
    FromDate: string;
    ToDate: string;
    TenantId: number;
}

export interface IMonthWiseCollection {
    TenantId: number;
    Year: string;
    Category: string;
}

export interface ISeasonAdvance {
    TenantId: number;
    Category: string;
}


