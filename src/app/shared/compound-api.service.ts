import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http/';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({providedIn: 'root'})
export class CompoundAPIService {
  mainnetURL = 'https://api.compound.finance/api/v2/ctoken';

  constructor(
    private http: HttpClient,
  ) {}

  getSupplyRate(network: string): Observable<number> {
    if (network === 'mainnet') {
      return this.http.get(this.mainnetURL).pipe(map( (result: {cToken: [{symbol: string, supply_rate: {value: string}}]}) => {
          let cToken: {symbol: string, supply_rate: {value: string}};
          result.cToken.forEach(element => {
            if (element.symbol === 'cUSDC') {
              cToken = element;
            }
          });
          return +cToken.supply_rate.value;
      }));
    } else if (network === 'rinkeby') {
      return new Observable<number>( (observer) => {
        observer.next(0.075);
      });
    }
  }
}
