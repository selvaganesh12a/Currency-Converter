import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  private apiURL = 'https://api.exchangerate-api.com/v4/latest/USD';

  constructor(private http: HttpClient) {}

  getExchangeRates(): Observable<any> {
    return this.http.get<any>(this.apiURL).pipe(
      catchError((error) => {
        console.log('Error fetching exchange rates: ', error);
        return throwError(() => Error('Failed to fetch exchange rates. Please try again later.'));
      })
    );
  }
}
