export interface IGetUser {
    TenantId:any;
}

export interface IUserSave
{
    UserId: number;
    LoginUserName: string;
    UserFirstName: string;
    UserMiddleName: string;
    UserLastName: string;
    UserEmail: string;
    ContactNo: string;
    Password: string;
    UserRoleId: number;
    TenantId: number;
    IsActive: boolean;
    CreatedBy: number;
}
