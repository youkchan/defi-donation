import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DataStorageService } from './data-storage.service';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { ProjectService } from '../projects/project.service';
import { defer } from 'rxjs';
import { Project } from '../projects/project.model';
import { Web3Service } from './web3.service';
import { Providers } from 'web3-core';
import { NgZone } from '@angular/core';


describe('Web3Service', () => {
  let web3Service: Web3Service;

  beforeEach(() => {
    const ngZone = new NgZone({});
    web3Service = new Web3Service(ngZone);
  });

  it('Not ethereum browser', () => {
    expect(() => {web3Service.bootstrapWeb3(); }).toThrow();
    expect(web3Service.isConnectMetamask).toBeFalsy();
  });

  it('Ethereum browser Rinkeby', () => {
    const ethereumSpy = jasmine.createSpyObj('Ethereum', ['enable', 'on']);
    ethereumSpy.networkVersion = '4';
    spyOn<any>(web3Service, 'getEthereumObj').and.callFake(() => ethereumSpy );
    ethereumSpy.enable.and.returnValue(new Promise(resolve => {/*nothing*/}));
    ethereumSpy.on.and.returnValue(new Promise(resolve => {/*nothing*/}));
    web3Service.bootstrapWeb3();
    expect(web3Service.isConnectMetamask).toBeTruthy();
  });

  it('Ethereum browser Rinkeby', () => {
    const ethereumSpy = jasmine.createSpyObj('Ethereum', ['enable', 'on']);
    ethereumSpy.networkVersion = '1';
    spyOn<any>(web3Service, 'getEthereumObj').and.callFake(() => ethereumSpy );
    ethereumSpy.enable.and.returnValue(new Promise(resolve => {/*nothing*/}));
    ethereumSpy.on.and.returnValue(new Promise(resolve => {/*nothing*/}));

    web3Service.bootstrapWeb3();
    expect(web3Service.isConnectMetamask).toBeFalsy();
  });

  it('isReady True', () => {
    const web3ServiceSpy: any = web3Service;
    web3ServiceSpy.web3 = {};
    expect(web3ServiceSpy.isReady()).toBeTruthy();
  });

  it('isReady false', () => {
    expect(web3Service.isReady()).toBeFalsy();
  });

  it('getContract', () => {
    const web3ServiceSpy: any = web3Service;
    const eth = jasmine.createSpyObj('Ethereum', ['Contract']);
    web3ServiceSpy.web3 = {eth};
    web3ServiceSpy.web3.eth.Contract.withArgs('abi', 'address').and.returnValue(new Promise(resolve => {resolve(true); } ));
    expect(web3ServiceSpy.getContract('abi', 'address')).toBeTruthy();
  });

  it('getContract if web3 isnt initialized, looping' , (done) => {
    web3Service.getContract('abi', 'address').then((result) => {
      expect(null).toEqual(result);
      done();
    });
  });

  it('beReady fail', (done) => {
   web3Service.beReady().then((result) => {
      expect(null).toEqual(result);
      done();
   });
  });

  it('beReady', (done) => {
    const web3ServiceSpy: any = web3Service;
    web3ServiceSpy.web3 = {};
    web3ServiceSpy.beReady().then((result) => {
      expect(0).toEqual(web3ServiceSpy.errCount);
      done();
    });
  });

  it('refreshAccounts', (done) => {
    const expectArray = ['0x8225Afb2C5A6A68525E22A7E237BcE1600A665f5'];
    spyOn<any>(web3Service, 'getAccount').and.returnValue(expectArray);
    const web3ServiceSpy: any = web3Service;
    web3ServiceSpy.refreshAccounts().then(() => {
      expect(expectArray).toEqual(web3ServiceSpy.accounts);
      done();
    });
  });
});
