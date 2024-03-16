export interface ISaveSeasonAdvance {
    SeasonAdvanceId: number;
    AdvancedDate: string;
    ClientId: number;
    Amount: number;
    TenantId: number;
    CreatedBy: number;
}

export interface IGetseasonAdvance {
    FromDate: string;
    ToDate: string;
    TenantId: number;
}


