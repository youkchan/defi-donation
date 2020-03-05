import { DataStorageService } from './data-storage.service';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { ProjectService } from '../projects/project.service';
import { defer } from 'rxjs';
import { Project } from '../projects/project.model';
import { Web3Service } from './web3.service';
import { Providers } from 'web3-core';
import { USDCContractService } from './usdc-contract.service';
import { NgZone } from '@angular/core';


describe('USDCContractService', () => {
  let usdcContractService: USDCContractService;
  let usdcContractServiceSpy: any;

  beforeEach(() => {
    const ngZone = new NgZone({});
    usdcContractService = new USDCContractService(new Web3Service(ngZone));
    usdcContractServiceSpy = usdcContractService;
  });

  it('initialize', (done) => {
    expect(usdcContractServiceSpy).toBeTruthy();
    expect(usdcContractServiceSpy.usdc).not.toBeDefined();
    const expectedObj = {name: 'usdc'};
    spyOn(usdcContractServiceSpy, 'setDecimals');
    usdcContractServiceSpy.decimals = 6;
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

  it('calculateUnit up', () => {
    expect(10000000).toEqual(usdcContractServiceSpy.calculateUnit(10, true, 6));
  });

  it('calculateUnit down', () => {
    expect(50000).toEqual(usdcContractServiceSpy.calculateUnit(50000000, false, 3));
  });

  it('calculateUnit zero', () => {
    expect(0).toEqual(usdcContractServiceSpy.calculateUnit(0, false, 6));
  });

  it('setDecimals', async () => {
    const expectedDecimals = 3;
    const callObj = jasmine.createSpyObj('Ethereum', ['call']);
    callObj.call.and.returnValue(new Promise(resolve => {resolve(expectedDecimals); }));

    const methodsObj = jasmine.createSpyObj('Ethereum', ['decimals']);
    methodsObj.decimals.and.returnValue(callObj);

    usdcContractServiceSpy.usdc = {methods: methodsObj};
    await usdcContractServiceSpy.setDecimals();
    expect(expectedDecimals).toEqual(usdcContractServiceSpy.decimals);
  });


  it('getBalance Error', async () => {

    const callObj = jasmine.createSpyObj('Ethereum', ['call']);
    callObj.call.and.returnValue(new Promise((resolve, reject) => {reject(new Error('Some Error is occured!')); }));

    const methodsObj = jasmine.createSpyObj('Ethereum', ['balanceOf']);
    methodsObj.balanceOf.and.returnValue(callObj);
    spyOn(usdcContractServiceSpy.web3Service, 'getSelectedAddress').and.returnValue('0x8225Afb2C5A6A68525E22A7E237BcE1600A665f5');
    spyOn(usdcContractServiceSpy, 'initialize');

    usdcContractServiceSpy.usdc = {methods: methodsObj};
    await expectAsync(usdcContractServiceSpy.getBalance())
    .toBeRejectedWith(new Error('Some Error is occured!'));
  });

  it('getAllowance Error', async () => {
    const callObj = jasmine.createSpyObj('Ethereum', ['call']);
    callObj.call.and.returnValue(new Promise((resolve, reject) => {reject(new Error('Some Error is occured!')); }));

    const methodsObj = jasmine.createSpyObj('Ethereum', ['allowance']);
    methodsObj.allowance.and.returnValue(callObj);
    spyOn(usdcContractServiceSpy.web3Service, 'getSelectedAddress').and.returnValue('0x8225Afb2C5A6A68525E22A7E237BcE1600A665f5');
    spyOn(usdcContractServiceSpy, 'initialize');

    usdcContractServiceSpy.usdc = {methods: methodsObj};
    await expectAsync(usdcContractServiceSpy.getAllowance('address'))
    .toBeRejectedWith(new Error('Some Error is occured!'));
  });

  it('approve Error', async () => {
    const sendObj = jasmine.createSpyObj('Ethereum', ['send']);
    sendObj.send.and.returnValue(new Promise((resolve, reject) => {reject(new Error('Some Error is occured!')); }));

    const methodsObj = jasmine.createSpyObj('Ethereum', ['approve']);
    methodsObj.approve.and.returnValue(sendObj);
    spyOn(usdcContractServiceSpy.web3Service, 'getSelectedAddress').and.returnValue('0x8225Afb2C5A6A68525E22A7E237BcE1600A665f5');
    spyOn(usdcContractServiceSpy, 'calculateUnit').and.returnValue(10);
    spyOn(usdcContractServiceSpy, 'initialize');

    usdcContractServiceSpy.usdc = {methods: methodsObj};
    await expectAsync(usdcContractServiceSpy.approve('address', 10))
    .toBeRejectedWith(new Error('Some Error is occured!'));
  });



});
