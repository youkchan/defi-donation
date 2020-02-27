import { Injectable } from '@angular/core';
import { Web3Service } from './web3.service';
const usdcContract = require('../../../abi/FiatTokenV1.json');
const abi = usdcContract.abi;
const address = '0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b';

@Injectable({providedIn: 'root'})
export class USDCContractService {
  usdc: any;

  constructor(private web3Service: Web3Service) {}

  async initialize() {
    if (!this.usdc) {
      await this.beReady();
      this.usdc = await this.web3Service.getContract(abi, address);
    }
  }

  async beReady() {
    if (!this.web3Service.isReady()) {
      const delay = new Promise(resolve => setTimeout(resolve, 100));
      await delay;
      return this.beReady();
    }
  }

  async getBalance() {
    await this.initialize();
    return this.usdc.methods.balanceOf(this.web3Service.getSelectedAddress()).call();
  }

  async getAllowance(_address: string) {
    await this.initialize();
    return this.usdc.methods.allowance(this.web3Service.getSelectedAddress(), _address).call();
  }

  approve(_address: string, _amount: number) {
    return this.usdc.methods.approve(_address, _amount).
      send({from: this.web3Service.getSelectedAddress(), gas: 500000, gasPrice: 10000000000});
  }
}
