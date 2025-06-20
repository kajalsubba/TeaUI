import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubmissionService {

  private _isSubmitting = new BehaviorSubject<boolean>(false);

  constructor() { }
  
  get isSubmitting() {
    return this._isSubmitting.asObservable();
  }

  startSubmitting() {
    this._isSubmitting.next(true);
  }

  stopSubmitting() {
    this._isSubmitting.next(false);
  }
}
