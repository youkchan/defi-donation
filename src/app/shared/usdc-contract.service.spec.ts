import { DataStorageService } from './data-storage.service';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { ProjectService } from '../projects/project.service';
import { defer } from 'rxjs';
import { Project } from '../projects/project.model';
import { Web3Service } from './web3.service';
import { Providers } from 'web3-core';
import { USDCContractService } from './usdc-contract.service';


describe('USDCContractService', () => {
  let usdcContractService: USDCContractService;
  let usdcContractServiceSpy: any;

  beforeEach(() => {
    usdcContractService = new USDCContractService(new Web3Service());
    usdcContractServiceSpy = usdcContractService;
  });

  it('initialize', (done) => {
    expect(usdcContractServiceSpy).toBeTruthy();
    expect(usdcContractServiceSpy.usdc).not.toBeDefined();
    const expectedObj = {name: 'usdc'};
    usdcContractServiceSpy.initialize().then((result) => {
      expect(usdcContractServiceSpy.usdc).toEqual(expectedObj);
      done();
    });

    const eth = jasmine.createSpyObj('Ethereum', ['Contract']);
    eth.Contract.and.returnValue(new Promise(resolve => {resolve(expectedObj); }));
    setTimeout(() => {
      usdcContractServiceSpy.web3Service.web3 = {eth};
    }, 1000);
  });

});
