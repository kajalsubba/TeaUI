export interface IstgApprove {
TotalFirstWeight: any;
TotalWetLeaf: any;
TotalLongLeaf:any;
TotalDeduction:any;
TotalFinalWeight: any;
TenantId: any;
CreatedBy: any;
ApproveList:ICollectionList[]
}

export interface ICollectionList
{
    IsApprove: boolean;
    CollectionId: any;
    Status:any;
}
