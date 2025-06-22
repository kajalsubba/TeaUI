export interface SaveRecoveryModel {
    RecoveryDate: string;
    ClientId: number;
    ClientCategory: string;
    CategoryId: number;
    RecoveryType: string;
    FieldBalance: number;
    Amount: number;
    Narration: string;
    TenantId: number;
    CreatedBy: number;
}

export interface RecoveryFilterRequest {
    TenantId?: number;
    FromDate?: string;
    ToDate?: string;
    CategoryId?: number;
    ClientId?: number;
    RecovertType?: string;
    CreatedBy?: number;
}