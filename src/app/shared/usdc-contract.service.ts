import { Injectable } from '@angular/core';
import { Web3Service } from './web3.service';
const usdcContract = require('../../../abi/FiatTokenV1.json');
const abi = usdcContract.abi;
const address = '0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b';

@Injectable({providedIn: 'root'})
export class USDCContractService {
  usdc: any;
  decimals: number;

  constructor(private web3Service: Web3Service) {}

  async initialize() {
    if (!this.usdc) {
      await this.beReady();
      this.usdc = await this.web3Service.getContract(abi, address);
      await this.setDecimals();
    }
  }

  async beReady() {
    if (!this.web3Service.isReady()) {
      const delay = new Promise(resolve => setTimeout(resolve, 100));
      await delay;
      return this.beReady();
    }
  }

  async setDecimals() {
    const decimals = await this.usdc.methods.decimals().call();
    this.decimals = decimals;
  }

  private calculateUnit(_amount: number, _isUp: boolean, _decimals: number) {
    if (typeof _amount !== 'number') {
      return 0;
    }

    if (_isUp) {
      return (_amount * (10 ** this.decimals));
    }
    return (_amount / (10 ** this.decimals));
  }

  async getBalance() {
    await this.initialize();
    const balance = await this.usdc.methods.balanceOf(this.web3Service.getSelectedAddress()).call();
    return Math.floor(this.calculateUnit(+balance, false, this.decimals));
  }

  async getAllowance(_address: string) {
    await this.initialize();
    const allowance =  await this.usdc.methods.allowance(this.web3Service.getSelectedAddress(), _address).call();
    return this.calculateUnit(+allowance, false, this.decimals);
  }

  approve(_address: string, _amount: number) {
    _amount = this.calculateUnit(_amount, true, this.decimals);
    return this.usdc.methods.approve(_address, _amount).
      send({from: this.web3Service.getSelectedAddress(), gas: 500000, gasPrice: 10000000000});
  }
}
