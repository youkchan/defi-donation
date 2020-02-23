import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import Web3 from 'web3';
const contract = require('@truffle/contract');

declare let window: any;

@Injectable({providedIn: 'root'})
export class Web3Service {
    private web3: any;
    private accounts: string[];
    public ready = false;
    public currentAddress: string;
    public accountsObservable = new Subject<string[]>();
    public isConnectMetamask: boolean;

    constructor() {
      window.addEventListener('load', (event) => {
        this.bootstrapWeb3();
      });
    }

    public bootstrapWeb3() {
      // Checking if Web3 has been injected by the browser (Mist/MetaMask)
      if (typeof window.ethereum !== 'undefined') {
        // Use Mist/MetaMask's provider
        window.ethereum.enable().then( () => {
          this.web3 = new Web3(window.ethereum);
          this.currentAddress = window.ethereum.selectedAddress;
          this.refreshAccounts();
        });
        this.isConnectMetamask = true;
        if (window.ethereum.networkVersion !== '4') {
          this.isConnectMetamask = false;
        }
      } else {
        console.log('No web3? You should consider trying MetaMask!');

        this.isConnectMetamask = false;
        throw new Error('Non-Ethereum browser detected. You should consider trying Mist or MetaMask!');
      }

      window.ethereum.on('accountsChanged', async () => {
        this.refreshAccounts();
      });

    }

    public async artifactsToContract(artifacts) {
      if (!this.web3) {
        const delay = new Promise(resolve => setTimeout(resolve, 100));
        await delay;
        return await this.artifactsToContract(artifacts);
      }

      const contractAbstraction = contract(artifacts);
      contractAbstraction.setProvider(this.web3.currentProvider);
      return contractAbstraction;
    }

    public async beReady() {
      if (!this.ready) {
        const delay = new Promise(resolve => setTimeout(resolve, 100));
        await delay;
        return await this.beReady();
      }
    }

    public async getContract(abi, address) {
      if (!this.web3) {
        const delay = new Promise(resolve => setTimeout(resolve, 100));
        await delay;
        return await this.getContract(abi, address);
      }

      return new this.web3.eth.Contract(abi , address);
    }

    private async refreshAccounts() {
      const accs = await this.web3.eth.getAccounts();
      // this.selectedAddress.next(await window.ethereum.selectedAddress);
      this.currentAddress = await window.ethereum.selectedAddress;
      console.log(accs);
      console.log('Refreshing accounts');

      // Get the initial account balance so it can be displayed.
      if (accs.length === 0) {
        console.warn('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
        return;
      }

      if (!this.accounts || this.accounts.length !== accs.length || this.accounts[0] !== accs[0]) {
        console.log('Observed new accounts');

        this.accountsObservable.next(accs);
        this.accounts = accs;
      }

      this.ready = true;
    }
}
