


import { DataStorageService } from './data-storage.service';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { ProjectService } from '../projects/project.service';
import { defer } from 'rxjs';
import { Project } from '../projects/project.model';
import { Web3Service } from './web3.service';
import { Providers } from 'web3-core';
import { USDCContractService } from './usdc-contract.service';
import { DeFiDonationContractService } from './defidonation-contract.service';
import { NgZone } from '@angular/core';


describe('DeFiDonationContractService', () => {
  let deFiDonationContractService: DeFiDonationContractService;
  let deFiDonationContractServiceSpy: any;

  beforeEach(() => {
    const ngZone = new NgZone({});
    deFiDonationContractService = new DeFiDonationContractService(new Web3Service(ngZone));
    deFiDonationContractServiceSpy = deFiDonationContractService;
  });

  it('initialize ', (done) => {
    expect(deFiDonationContractServiceSpy).toBeTruthy();
    expect(deFiDonationContractServiceSpy.deFiDonation).not.toBeDefined();
    const expectedObj = {name: 'usdc'};
    deFiDonationContractServiceSpy.initialize().then((result) => {
      expect(deFiDonationContractServiceSpy.deFiDonation).toEqual(expectedObj);
      done();
    });
    const eth = jasmine.createSpyObj('Ethereum', ['Contract']);
    eth.Contract.and.returnValue(new Promise(resolve => {resolve(expectedObj); }));
    setTimeout(() => {
      deFiDonationContractServiceSpy.web3Service.web3 = {eth};
    }, 1000);
  });

  it('setDonationAccount not Account Exists', (done) => {
    expect(deFiDonationContractServiceSpy).toBeTruthy();
    const expectedObj = {name: 'usdc'};
    const eth = jasmine.createSpyObj('Ethereum', ['Contract']);
    eth.Contract.and.returnValue(new Promise(resolve => {resolve(expectedObj); }));
    deFiDonationContractServiceSpy.web3Service.web3 = {eth};
    spyOn(deFiDonationContractServiceSpy, 'isAccountExists').and.returnValue(new Promise(resolve => {resolve(false); }));
    deFiDonationContractServiceSpy.initialize().then(async () => {
      expect(await deFiDonationContractServiceSpy.setDonationAccount()).toBeFalsy();
      done();
    });
  });

  it('setDonationAccount Account Exists', (done) => {
    expect(deFiDonationContractServiceSpy).toBeTruthy();
    const expectedObj = {name: 'usdc'};
    const eth = jasmine.createSpyObj('Ethereum', ['Contract']);
    eth.Contract.and.returnValue(new Promise(resolve => {resolve(expectedObj); }));
    deFiDonationContractServiceSpy.web3Service.web3 = {eth};
    spyOn(deFiDonationContractServiceSpy, 'isAccountExists').and.returnValue(new Promise(resolve => {resolve(true); }));
    spyOn(deFiDonationContractServiceSpy, 'getDonationAccount').and.returnValue(new Promise(resolve => {resolve(true); }));

    deFiDonationContractServiceSpy.initialize().then(async () => {
      await deFiDonationContractServiceSpy.setDonationAccount();
      expect(expectedObj).toEqual(deFiDonationContractServiceSpy.donationAccount);
      done();
    });
  });

  it('calculateUnit up', () => {
    expect(10000000).toEqual(deFiDonationContractServiceSpy.calculateUnit(10, true, 6));
  });

  it('calculateUnit down', () => {
    expect(50).toEqual(deFiDonationContractServiceSpy.calculateUnit(50000000, false, 6));
  });

  it('calculateUnit zero', () => {
    expect(0).toEqual(deFiDonationContractServiceSpy.calculateUnit(0, false, 6));
  });


  it('createDonationAccount', async () => {
    const methodsObj = jasmine.createSpyObj('Ethereum', ['createDonationAccount']);
    const sendObj = jasmine.createSpyObj('Ethereum', ['send']);
    sendObj.send.and.returnValue(new Promise((resolve, reject) => {reject(new Error('Transaction has been reverted by the EVM')); }));
    methodsObj.createDonationAccount.and.returnValue(sendObj);

    spyOn(deFiDonationContractServiceSpy.web3Service, 'getSelectedAddress').and.returnValue('0x8225Afb2C5A6A68525E22A7E237BcE1600A665f5');
    spyOn(deFiDonationContractServiceSpy, 'calculateUnit').and.returnValue(10);
    spyOn(deFiDonationContractServiceSpy, 'initialize');

    deFiDonationContractServiceSpy.deFiDonation = {methods: methodsObj};
    await expectAsync(deFiDonationContractServiceSpy.createDonationAccount())
    .toBeRejectedWith(new Error('Lack of Gas'));

  });

  it('supply error', async () => {
    const sendObj = jasmine.createSpyObj('Ethereum', ['send']);
    sendObj.send.and.returnValue(new Promise((resolve, reject) => {reject(new Error('Some Error is occured!')); }));

    const methodsObj = jasmine.createSpyObj('Ethereum', ['supply']);
    methodsObj.supply.and.returnValue(sendObj);
    spyOn(deFiDonationContractServiceSpy.web3Service, 'getSelectedAddress').and.returnValue('0x8225Afb2C5A6A68525E22A7E237BcE1600A665f5');
    spyOn(deFiDonationContractServiceSpy, 'calculateUnit').and.returnValue(10);
    spyOn(deFiDonationContractServiceSpy, 'initialize');

    deFiDonationContractServiceSpy.donationAccount = {methods: methodsObj};
    await expectAsync(deFiDonationContractServiceSpy.supply(10, 6))
    .toBeRejectedWith(new Error('Some Error is occured!'));
  });

  it('redeem error', async () => {
    const sendObj = jasmine.createSpyObj('Ethereum', ['send']);
    sendObj.send.and.returnValue(new Promise((resolve, reject) => {reject(new Error('Some Error is occured!')); }));

    const methodsObj = jasmine.createSpyObj('Ethereum', ['redeem']);
    methodsObj.redeem.and.returnValue(sendObj);
    spyOn(deFiDonationContractServiceSpy.web3Service, 'getSelectedAddress').and.returnValue('0x8225Afb2C5A6A68525E22A7E237BcE1600A665f5');
    spyOn(deFiDonationContractServiceSpy, 'calculateUnit').and.returnValue(10);
    spyOn(deFiDonationContractServiceSpy, 'initialize');

    deFiDonationContractServiceSpy.donationAccount = {methods: methodsObj};
    await expectAsync(deFiDonationContractServiceSpy.redeem(10, 6))
    .toBeRejectedWith(new Error('Some Error is occured!'));
  });

  it('addDonateProject error', async () => {
    const sendObj = jasmine.createSpyObj('Ethereum', ['send']);
    sendObj.send.and.returnValue(new Promise((resolve, reject) => {reject(new Error('Some Error is occured!')); }));

    const methodsObj = jasmine.createSpyObj('Ethereum', ['addDonateProject']);
    methodsObj.addDonateProject.and.returnValue(sendObj);
    spyOn(deFiDonationContractServiceSpy.web3Service, 'getSelectedAddress').and.returnValue('0x8225Afb2C5A6A68525E22A7E237BcE1600A665f5');
    spyOn(deFiDonationContractServiceSpy, 'calculateUnit').and.returnValue(10);
    spyOn(deFiDonationContractServiceSpy, 'initialize');

    deFiDonationContractServiceSpy.donationAccount = {methods: methodsObj};
    await expectAsync(deFiDonationContractServiceSpy.addDonateProject('address', 10, 6))
    .toBeRejectedWith(new Error('Some Error is occured!'));
  });

  it('donate error', async () => {
    const sendObj = jasmine.createSpyObj('Ethereum', ['send']);
    sendObj.send.and.returnValue(new Promise((resolve, reject) => {reject(new Error('Some Error is occured!')); }));

    const methodsObj = jasmine.createSpyObj('Ethereum', ['donate']);
    methodsObj.donate.and.returnValue(sendObj);
    spyOn(deFiDonationContractServiceSpy.web3Service, 'getSelectedAddress').and.returnValue('0x8225Afb2C5A6A68525E22A7E237BcE1600A665f5');
    spyOn(deFiDonationContractServiceSpy, 'initialize');

    deFiDonationContractServiceSpy.donationAccount = {methods: methodsObj};
    await expectAsync(deFiDonationContractServiceSpy.donate('address'))
    .toBeRejectedWith(new Error('Some Error is occured!'));
  });

  it('getDonationAccount error', async () => {
    const callObj = jasmine.createSpyObj('Ethereum', ['call']);
    callObj.call.and.returnValue(new Promise((resolve, reject) => {reject(new Error('Some Error is occured!')); }));

    const methodsObj = jasmine.createSpyObj('Ethereum', ['getDonationAccount']);
    methodsObj.getDonationAccount.and.returnValue(callObj);
    spyOn(deFiDonationContractServiceSpy.web3Service, 'getSelectedAddress').and.returnValue('0x8225Afb2C5A6A68525E22A7E237BcE1600A665f5');
    spyOn(deFiDonationContractServiceSpy, 'initialize');

    deFiDonationContractServiceSpy.deFiDonation = {methods: methodsObj};
    await expectAsync(deFiDonationContractServiceSpy.getDonationAccount())
    .toBeRejectedWith(new Error('Some Error is occured!'));
  });

  it('isAccountExists error', async () => {
    const callObj = jasmine.createSpyObj('Ethereum', ['call']);
    callObj.call.and.returnValue(new Promise((resolve, reject) => {reject(new Error('Some Error is occured!')); }));

    const methodsObj = jasmine.createSpyObj('Ethereum', ['isAccountExists']);
    methodsObj.isAccountExists.and.returnValue(callObj);
    spyOn(deFiDonationContractServiceSpy.web3Service, 'getSelectedAddress').and.returnValue('0x8225Afb2C5A6A68525E22A7E237BcE1600A665f5');
    spyOn(deFiDonationContractServiceSpy, 'initialize');

    deFiDonationContractServiceSpy.deFiDonation = {methods: methodsObj};
    await expectAsync(deFiDonationContractServiceSpy.isAccountExists())
    .toBeRejectedWith(new Error('Some Error is occured!'));
  });

  it('getUnderlyingBalance error', async () => {
    const callObj = jasmine.createSpyObj('Ethereum', ['call']);
    callObj.call.and.returnValue(new Promise((resolve, reject) => {reject(new Error('Some Error is occured!')); }));

    const methodsObj = jasmine.createSpyObj('Ethereum', ['getUnderlyingBalance']);
    methodsObj.getUnderlyingBalance.and.returnValue(callObj);
    spyOn(deFiDonationContractServiceSpy.web3Service, 'getSelectedAddress').and.returnValue('0x8225Afb2C5A6A68525E22A7E237BcE1600A665f5');
    spyOn(deFiDonationContractServiceSpy, 'initialize');

    deFiDonationContractServiceSpy.donationAccount = {methods: methodsObj};
    await expectAsync(deFiDonationContractServiceSpy.getUnderlyingBalance(6))
    .toBeRejectedWith(new Error('Some Error is occured!'));
  });





});
