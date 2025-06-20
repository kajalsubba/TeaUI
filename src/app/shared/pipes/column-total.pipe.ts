import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'columnTotal'
})
export class ColumnTotalPipe implements PipeTransform {
  transform(data: any[], columnName: string): number {
    if (!data || !columnName) return 0;
    
    return data.reduce((acc, curr) => acc + curr[columnName], 0);
  }
}
