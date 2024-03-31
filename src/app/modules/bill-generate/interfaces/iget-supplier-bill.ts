export interface IgetSupplierBill {
    FromDate: string;
    ToDate: string;
    ClientId: number;
    TenantId: number;
}
export interface SaveSupplierBill {
    BillDate: any;
    FromDate: any;
    ToDate: any;
    ClientId: number;
    FinalWeight: number;
    TotalStgAmount: number;
    TotalStgPayment: number;
    PreviousBalance: number;
    StandingSeasonAdv: number;
    Commision: number;
    GreenLeafCess: number;
    FinalBillAmount: number;
    LessSeasonAdv: number;
    AmountToPay: number;
    TenantId: number;
    CreatedBy: number;
    CollectionData: SupplierCollectionData[];
    PaymentData: SupplierPaymentData[];
  }
  
 export interface SupplierCollectionData {
    CollectionId: number;
  }
  
  export interface SupplierPaymentData {
    PaymentId: number;
  }
  