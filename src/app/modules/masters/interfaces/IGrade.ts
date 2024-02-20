export interface ISaveGrade {
  GradeId: number;
  GradeName: string;
  TenantId: number;
  CreatedBy: number;
}

export interface IGetGrade {
  TenantId: number;

}

export interface IDeleteGrade
{
  GradeId: number;
}



