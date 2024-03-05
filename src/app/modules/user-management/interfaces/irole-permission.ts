export interface IpermissionLists {
    UserRoleId: number;
    SubModuleId: number;
    DeleteData: boolean;
    EditData: boolean;
    HideModule: boolean;
    SaveData: boolean;
    Upload: boolean;
    ViewData: boolean;
    TenantId: number;
}

export interface ISaveRolePermission
{
    TenantId:number;
    CreatedBy:number;
    PermissionLists:IpermissionLists[]
}

export interface IGetRolePermission {

    TenantId:any;
    RoleId:any;
   
}