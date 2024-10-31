export interface IGetNotifications {
    TenantId:number;
}

export interface IModulePermissions {
    DeleteData: boolean;
    EditData: boolean;
    HideModule: boolean;
    MasterModuleName: string;
    ModuleId: number;
    Priority: number;
    SaveData: boolean;
    SubModuleName: string;
    TenantId: number;
    Upload: boolean;
    ViewData: boolean;
    subModuleId:number;
}