import { Injectable, OnInit } from '@angular/core';
import { Web3Service } from './web3.service';
const defiContract = require('../../../abi/DeFiDonation.json');
const donationAccountContract = require('../../../abi/DonationAccount.json');
const abi = defiContract.abi;
const donationAbi = donationAccountContract.abi;
const address = defiContract.networks['4'].address;

@Injectable({providedIn: 'root'})
export class DeFiDonationContractService {
  deFiDonation: any;
  donationAccount: any;

  constructor(private web3Service: Web3Service) {}

  async initialize() {
    if (!this.deFiDonation) {
      await this.beReady();
      this.deFiDonation = await this.web3Service.getContract(abi, address);
    }
  }

  async setDonationAccount() {
    if (!this.deFiDonation ) {
      return false;
    }

    const isAccountExists = await this.isAccountExists();
    if (!isAccountExists) {
      return false;
    }

    const _address = await this.getDonationAccount();
    this.donationAccount =  await this.web3Service.getContract(donationAbi, _address);
  }

  public async beReady() {
    if (!this.web3Service.isReady()) {
      const delay = new Promise(resolve => setTimeout(resolve, 100));
      await delay;
      return this.beReady();
    }
  }

  isAccountExists(): Promise<any> {
    return this.deFiDonation.methods.isAccountExists().call({from: this.web3Service.getSelectedAddress()});
  }

  getSupplyRate(): Promise<any> {
    return this.deFiDonation.methods.getSupplyRate().call({from: this.web3Service.getSelectedAddress()});
  }

  getDonationAccount(): Promise<any> {
    return this.deFiDonation.methods.getDonationAccount().call({from: this.web3Service.getSelectedAddress()});
  }

  createDonationAccount() {
    return this.deFiDonation.methods.createDonationAccount()
      .send({from: this.web3Service.getSelectedAddress(), gas: 900000, gasPrice: 10000000000})
      .catch ((error) => {
        if (error.message.includes('Transaction has been reverted by the EVM')) {
          console.log('Lack of Gas');
        }
      });
  }

  supply(amount: number) {
    return this.donationAccount.methods.supply(amount)
      .send({from: this.web3Service.getSelectedAddress(), gas: 700000, gasPrice: 10000000000})
      .catch ((error) => {
        console.log(error);
      });
  }

  getUnderlyingBalance(): Promise<any> {
    return this.donationAccount.methods.getUnderlyingBalance().call({from: this.web3Service.getSelectedAddress()});
  }

/*  redeem(amount: number) {
    return this.DonationAccount.methods.redeem(amount)
      .send({from: this.web3Service.getSelectedAddress(), gas: 700000, gasPrice: 10000000000})
      .catch((error)=> {
        console.log(error);
      })
  }*/
}
