import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient, private config: ConfigService) {}

  private getRequestOptions(contentType: string = 'application/json'): { headers: HttpHeaders } {
    const headers = new HttpHeaders({
      'Content-Type': contentType,
      // Add any other headers as needed
    });

    return { headers };
  }

  private handleHttpError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.message || 'Internal Server Error';
    }

    console.error(errorMessage);
    return throwError(errorMessage);
  }

  private logRequest(method: string, endpoint: string, data?: any): void {
    console.log(`Sending ${method} request to ${this.config.apiUrl}/${endpoint}`);
    if (data) {
      console.log('Request Data:', data);
    }
  }

  private logResponse(method: string, endpoint: string, response: any): void {
    console.log(`Received ${method} response from ${this.config.apiUrl}/${endpoint}`);
    console.log('Response Data:', response);
  }

  get<T>(endpoint: string): Observable<T> {
    this.logRequest('GET', endpoint);

    return this.http.get<T>(`${this.config.apiUrl}/${endpoint}`, this.getRequestOptions()).pipe(
      tap((response) => this.logResponse('GET', endpoint, response)),
      catchError(this.handleHttpError)
    );
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    this.logRequest('POST', endpoint, data);

    return this.http.post<T>(`${this.config.apiUrl}/${endpoint}`, data, this.getRequestOptions()).pipe(
      tap((response) => this.logResponse('POST', endpoint, response)),
      catchError(this.handleHttpError)
    );
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    this.logRequest('PUT', endpoint, data);

    return this.http.put<T>(`${this.config.apiUrl}/${endpoint}`, data, this.getRequestOptions()).pipe(
      tap((response) => this.logResponse('PUT', endpoint, response)),
      catchError(this.handleHttpError)
    );
  }

  patch<T>(endpoint: string, data: any): Observable<T> {
    this.logRequest('PATCH', endpoint, data);

    return this.http.patch<T>(`${this.config.apiUrl}/${endpoint}`, data, this.getRequestOptions()).pipe(
      tap((response) => this.logResponse('PATCH', endpoint, response)),
      catchError(this.handleHttpError)
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    this.logRequest('DELETE', endpoint);

    return this.http.delete<T>(`${this.config.apiUrl}/${endpoint}`, this.getRequestOptions()).pipe(
      tap((response) => this.logResponse('DELETE', endpoint, response)),
      catchError(this.handleHttpError)
    );
  }
}
