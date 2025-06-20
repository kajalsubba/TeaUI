export interface IGetStgBill {
    FromDate: string;
    ToDate: string;
    ClientId: number;
    TenantId: number;
}
export interface IClient {
  ClientId: number;
  ClientName: string;
}

export interface SaveStgBill {
    BillDate: any;
    FromDate: any;
    ToDate: any;
    ClientId: number;
    FinalWeight: number;
    TotalStgAmount: number;
    TotalStgPayment: number;
    PreviousBalance: number;
    StandingSeasonAdv: number;
    Incentive: number;
    Transporting: number;
    GreenLeafCess: number;
    FinalBillAmount: number;
    LessSeasonAdv: number;
    AmountToPay: number;
    PaidAmount: number;
    OutstandingAmount: number;
    TenantId: number;
    CreatedBy: number;
    CollectionData: StgCollectionData[];
    PaymentData: StgPaymentData[];
  }
  
 export interface StgCollectionData {
    CollectionId: number;
  }
  
  export interface StgPaymentData {
    PaymentId: number;
  }
  
