import { Injectable, OnInit } from '@angular/core';
import { Web3Service } from './web3.service';
import { USDCContractService } from './usdc-contract.service';
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

  private calculateUnit(_amount: number, _isUp: boolean, _decimals: number) {
    if (typeof _amount !== 'number' || _amount === 0) {
      return 0;
    }

    if (_isUp) {
      return (_amount * (10 ** _decimals));
    }
    return (_amount / (10 ** _decimals));
  }


  async setDonationAccount() {
    await this.initialize();

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

  async isAccountExists(): Promise<boolean> {
    try {
      await this.initialize();
      return await this.deFiDonation.methods.isAccountExists().call({from: this.web3Service.getSelectedAddress()});
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getDonationAccount(): Promise<string> {
    try {
      await this.initialize();
      return await this.deFiDonation.methods.getDonationAccount().call({from: this.web3Service.getSelectedAddress()});
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async createDonationAccount(): Promise<void> {
    try {
      await this.initialize();
      const tx = await this.deFiDonation.methods.createDonationAccount()
        .send({from: this.web3Service.getSelectedAddress(), gas: 1200000, gasPrice: 10000000000});
      console.log(tx);
    } catch (e) {
      if (e.message.includes('Transaction has been reverted by the EVM')) {
        e.message = 'Lack of Gas';
      }
      throw new Error(e.message);
    }
  }

  async supply(_amount: number, _decimals: number): Promise<void> {
    try {
      await this.initialize();
      _amount = this.calculateUnit(_amount, true, _decimals);
      const tx = await this.donationAccount.methods.supply(_amount)
        .send({from: this.web3Service.getSelectedAddress(), gas: 400000, gasPrice: 10000000000});
      console.log(tx);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getUnderlyingBalance(_decimals: number): Promise<number> {
    try {
      await this.initialize();
      const balance =  await this.donationAccount.methods.getUnderlyingBalance().call({from: this.web3Service.getSelectedAddress()});
      return this.calculateUnit(+balance, false, _decimals);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async redeem(_amount: number, _decimals: number): Promise<void> {
    try {
      await this.initialize();
      _amount = this.calculateUnit(_amount, true, _decimals);
      const tx = await this.donationAccount.methods.redeem(_amount)
        .send({from: this.web3Service.getSelectedAddress(), gas: 200000, gasPrice: 10000000000});
      console.log(tx);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async addDonateProject(_address: string, _amount: number, _decimals: number): Promise<void> {
    try {
      await this.initialize();
      _amount = this.calculateUnit(_amount, true, _decimals);
      const tx = await this.donationAccount.methods.addDonateProject(_address, _amount)
        .send({from: this.web3Service.getSelectedAddress(), gas: 100000, gasPrice: 10000000000});
      console.log(tx);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async donate(_address: string): Promise<void> {
    try {
      await this.initialize();
      const tx = await this.donationAccount.methods.donate(_address)
        .send({from: this.web3Service.getSelectedAddress(), gas: 200000, gasPrice: 10000000000});
      console.log(tx);
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
