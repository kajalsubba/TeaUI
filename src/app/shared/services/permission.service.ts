import { Injectable } from '@angular/core';
import { HelperService } from 'src/app/core/services/helper.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  PermissionDetails:any;
  IsMenuHide:boolean=false;

  constructor(public helper: HelperService) { }

  //this.helper.getItem('loginDetails');
  ngOnInit(): void {
    this.PermissionDetails = this.helper.getItem('PermissionDetails');

   // console.log(this.helper.getItem('PermissionDetails'),'permission');
   this.IsMenuHide=this.PermissionDetails
 
  }

}
