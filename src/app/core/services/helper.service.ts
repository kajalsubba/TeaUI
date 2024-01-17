import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  constructor() {}

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

  // Remove item from session storage
  removeItem(key: string): void {
    sessionStorage.removeItem(key);
  }

  // Clear all items from session storage
  clear(): void {
    sessionStorage.clear();
  }
}
