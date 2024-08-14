export interface ISaveSeasonAdvance {
    SeasonAdvanceId: number;
    AdvancedDate: Date | string;
    ClientCategory: string;
    ClientId: number;
    Amount: number;
    Narration:string;
    CategoryId:number;
    TenantId: number;
    CreatedBy: number;
}

export interface IGetseasonAdvance {
    FromDate: string;
    ToDate: string;
    TenantId: number;
    ClientId: number;
    ClientCategory:string;
}


