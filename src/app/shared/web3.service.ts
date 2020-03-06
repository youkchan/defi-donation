import {Injectable, NgZone} from '@angular/core';
import {Subject} from 'rxjs';
import Web3 from 'web3';
const contract = require('@truffle/contract');

declare let window: any;

@Injectable({providedIn: 'root'})
export class Web3Service {
    private web3: any;
    private accounts: string[];
    public accountsObservable = new Subject<boolean>();
    public isConnectMetamask: boolean;
    errCount = 0;
    network = 'Not supported Network';

    constructor(private ngZone: NgZone) {
      window.addEventListener('load', (event) => {
        this.bootstrapWeb3();
      });
    }

    public bootstrapWeb3() {
      // Checking if Web3 has been injected by the browser (Mist/MetaMask)
      const ethereum = this.getEthereumObj();
      if (typeof ethereum !== 'undefined') {
        // Use Mist/MetaMask's provider
        ethereum.enable().then( () => {
          this.web3 = this.instantiateWeb3();
          this.refreshAccounts();
        });

        this.isConnectMetamask = true;
        if (ethereum.networkVersion !== '4') {
          this.isConnectMetamask = false;
        } else {
          this.network = 'Rinkeby Network';
        }
      } else {
        this.isConnectMetamask = false;
        throw new Error('Non-Ethereum browser detected. You should consider trying Mist or MetaMask!');
      }

      ethereum.on('accountsChanged', async () => {
        this.refreshAccounts();
      });

    }

    private instantiateWeb3() {
      return new Web3(window.ethereum);
    }

    private getEthereumObj() {
      return window.ethereum;
    }

/*    public async artifactsToContract(artifacts) {
      if (!this.web3) {
        const delay = new Promise(resolve => setTimeout(resolve, 100));
        await delay;
        return await this.artifactsToContract(artifacts);
      }

      const contractAbstraction = contract(artifacts);
      contractAbstraction.setProvider(this.web3.currentProvider);
      return contractAbstraction;
    }*/

    public async beReady() {

      if (!this.web3) {
        const delay = new Promise(resolve => setTimeout(resolve, 200));
        await delay;
        if (this.errCount === 10) {
          return null;
        }
        this.errCount++;
        return this.beReady();
      }

      this.errCount = 0;
    }

    public isReady() {
      return this.web3 ? true : false;
    }

    public getSelectedAddress() {
      return window.ethereum.selectedAddress;
    }

    public async getContract(abi, address) {
      if (!this.web3) {
        const delay = new Promise(resolve => setTimeout(resolve, 100));
        await delay;
        if (this.errCount === 10) {
          return null;
        }
        this.errCount++;
        return this.getContract(abi, address);
      }

      this.errCount = 0;
      return new this.web3.eth.Contract(abi , address);
    }

    private getAccount() {

      return this.web3.eth.getAccounts();
    }

    /*
    async requireSignature() {
      await this.beReady();
      return await this.web3.eth.personal.sign('ユーザー登録', this.getSelectedAddress(), null);
    }*/

    private async refreshAccounts() {
      const accs = await this.getAccount();
      console.log(accs);
      // this.selectedAddress.next(await window.ethereum.selectedAddress);
      console.log('Refreshing accounts');

      // Get the initial account balance so it can be displayed.
      if (accs.length === 0) {
        console.warn('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
        return;
      }

      if (!this.accounts || this.accounts.length !== accs.length || this.accounts[0] !== accs[0]) {
        console.log('Observed new accounts');

        this.ngZone.run(() => {
          this.accountsObservable.next(true);
        });
        this.accounts = accs;
      }

    }
}
