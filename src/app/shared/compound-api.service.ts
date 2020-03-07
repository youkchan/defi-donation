import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http/';
import { map, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Const } from './const';

@Injectable({providedIn: 'root'})
export class CompoundAPIService {
  mainnetURL = 'https://api.compound.finance/api/v2/ctoken';

  constructor(
    private http: HttpClient,
  ) {}

  getSupplyRate(network: string): Observable<number> {
    if (network === Const.MAINNET_NETWORK) {
      return this.http.get(this.mainnetURL)
      .pipe(
        map( (result: {cToken: [{symbol: string, supply_rate: {value: string}}]}) => {
          let cToken: {symbol: string, supply_rate: {value: string}};
          result.cToken.forEach(element => {
            if (element.symbol === Const.CUSDC_SYMBOL) {
              cToken = element;
            }
          });
          return +cToken.supply_rate.value;
      }),
        catchError(this.handleError)
      );
    } else if (network === Const.RINKEBY_NETWORK) {
      return new Observable<number>( (observer) => {
        observer.next(Const.RINKEBY_INTEREST);
      });
    }
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    return throwError(
      'Something bad happened; please try again later.'
      );
  }

}
