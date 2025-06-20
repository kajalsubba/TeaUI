import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  constructor(private route:Router) {}

  setItem(key: string, value: any): void {
    const stringValue = JSON.stringify(value);
    sessionStorage.setItem(key, stringValue);
  }

  // Get item from session storage
  getItem<T>(key: string): T | null {
    const storedValue = sessionStorage.getItem(key);

    if (storedValue) {
      return JSON.parse(storedValue) as T;
    }

    return null;
  }

  getCurrentRoute(){
    return this.route.url;
  }

  // Remove item from session storage
  removeItem(key: string): void {
    sessionStorage.removeItem(key);
  }

  // Clear all items from session storage
  clear(): void {
    sessionStorage.clear();
  }
}
