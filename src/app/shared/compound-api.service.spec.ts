import { defer } from 'rxjs';
import { CompoundAPIService } from './compound-api.service';
import { Const } from './const';

function asyncData<T>(data: T) {
  return defer(() => Promise.resolve(data));
}

describe('CompoundAPIService', () => {
  let httpClientSpy;
  let compoundAPIService: CompoundAPIService;

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);
    compoundAPIService = new CompoundAPIService(httpClientSpy as any);
  });

  it('getSupplyRate mainnet', (done) => {
    const expectedProjects: {cToken: {symbol: string, supply_rate: {value: string}}[]} = {
      cToken: [
        {symbol: 'cUSDC', supply_rate: {value: '0.01'}},
        {symbol: 'cDai', supply_rate: {value: '0.02'}},
      ]
    };

    httpClientSpy.get.and.returnValue(asyncData(expectedProjects));
    compoundAPIService.getSupplyRate(Const.MAINNET_NETWORK).subscribe(
      (response) => {
        expect(response).toEqual(+expectedProjects.cToken[0].supply_rate.value);
        done();
      }
    );
  });

  it('getSupplyRate rinkeby', (done) => {
    compoundAPIService.getSupplyRate(Const.RINKEBY_NETWORK).subscribe(
      (response) => {
        expect(Const.RINKEBY_INTEREST).toEqual(response);
        done();
      }
    );
  });

  it('handleError clientError', (done) => {
    const throwObj = {
      error: new ErrorEvent('clientError', {
        message : 'Some error occured!',
      })
    };

    spyOn(window.console, 'error');

    (compoundAPIService as any).handleError(throwObj).subscribe(
      result => {
      /* Nothing Happens */
      },
      error => {
        expect(window.console.error).toHaveBeenCalledWith('An error occurred:', 'Some error occured!');
        done();
      }
    );
  });

  it('handleError ServerError', (done) => {
    const status = 404;
    const throwObj = {status};

    spyOn(window.console, 'error');
    (compoundAPIService as any).handleError(throwObj).subscribe(
      result => {
      /* Nothing Happens */
      },
      error => {
        expect(window.console.error).toHaveBeenCalledWith(
            `Backend returned code ${status}, ` +
            `body was: undefined`
          );
        done();
      }
    );
  });

});
