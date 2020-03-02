


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


  it('createDonationAccount', () => {
    const eth = jasmine.createSpyObj('Ethereum', ['Contract']);
    eth.Contract.and.returnValue(new Promise(resolve => {resolve({name: 'usdc'}); }));
    deFiDonationContractServiceSpy.web3Service.web3 = {eth};

    const methods = jasmine.createSpyObj('Ethereum', ['createDonationAccount']);
    const send = jasmine.createSpyObj('Ethereum', ['send']);
    send.send.and.returnValue(new Promise((resolve, reject) => {reject(new Error('Transaction has been reverted by the EVM')); }));

    deFiDonationContractServiceSpy.initialize().then(async () => {
      spyOn(deFiDonationContractServiceSpy.web3Service, 'getSelectedAddress').and.returnValue('0x8225Afb2C5A6A68525E22A7E237BcE1600A665f5');
      methods.createDonationAccount.and.returnValue(send);
      deFiDonationContractServiceSpy.deFiDonation.methods = methods;
      expect(await deFiDonationContractServiceSpy.createDonationAccount()).toEqual('Lack of Gas');
   });
  });

});
