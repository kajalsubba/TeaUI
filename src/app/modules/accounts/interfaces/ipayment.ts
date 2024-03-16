export interface ISavePayment {

    PaymentId: number;
    PaymentDate: string;
    ClientCategory: string;
    ClientId: number;
    PaymentTypeId: number;
    Amount: number;
    Narration: string;
    TenantId: number;
    CreatedBy: number;
}

export interface IGetPayment {
    FromDate: string;
    ToDate: string;
    TenantId: number;
    ClientId: number;
    ClientCategory:string;
}
