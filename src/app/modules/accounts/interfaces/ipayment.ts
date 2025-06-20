export interface ISavePayment {

    PaymentId: number;
    PaymentDate: string;
    BillDate:string;
    ClientCategory: string;
    ClientId: number;
    PaymentTypeId: number;
    Amount: number;
    Narration: string;
    CategoryId:number;
    TenantId: number;
    CreatedBy: number;
    PaymentSource:string;
}

export interface IGetPayment {
    FromDate: string;
    ToDate: string;
    TenantId: number;
    ClientId: number;
    ClientCategory:string;
    PaymentTypeId:number;
    CreatedBy: number;
}
