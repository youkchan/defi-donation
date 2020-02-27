import { Component, OnInit, OnDestroy, ViewChild, Input, Output, EventEmitter, ChangeDetectorRef, NgZone } from '@angular/core';
import { ProjectService } from './project.service';
import { Project } from './project.model';
import { Subscription } from 'rxjs';
import { DataStorageService } from '../shared/data-storage.service';
import { Web3Service } from '../shared/web3.service';
import { DeFiDonationContractService } from '../shared/defidonation-contract.service';
import { USDCContractService } from '../shared/usdc-contract.service';
import { NgForm } from '@angular/forms';
import { CompoundAPIService } from '../shared/compound-api.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
})
export class ProjectsComponent implements OnInit, OnDestroy {
  projects: Project[] = [];
  projectsAll: Project[] = [];
  currentPagenation = 0;
  isLimit = false;
  subscription: Subscription;
  accountSubscription: Subscription;
  isAccountAvailable = false;
  usdcBalance = 0;
  usdcAllowanceBalance = 0;
  isLoading = false;
  underlyingBalance = 0;
  interestRate: number;
  dueDate: number;
  @ViewChild('donationForm', { static: false }) donationForm: NgForm;

  constructor(
    private projectService: ProjectService,
    private dataStorageService: DataStorageService,
    private defiDonationContractService: DeFiDonationContractService,
    private usdcContractService: USDCContractService,
    private compoundAPIService: CompoundAPIService,
    private web3Service: Web3Service,
  //  private ngZone: NgZone
    ) { }

  ngOnInit() {
    this.isLoading = true;
    this.subscription = this.projectService.projectChanged
      .subscribe(
        (projects: Project[]) => {
          this.projectsAll = projects;
          this.reloadProject();
        }
      );
    this.dataStorageService.fetchProjects().subscribe();

    this.accountSubscription = this.web3Service.accountsObservable.subscribe(() => {
      this.defiDonationContractService.initialize()
      .then(async () => {
        await this.defiDonationContractService.setDonationAccount();
      })
      .then(() => {
        this.checkDonationAccount();
      })
      .then(async () => {
        this.compoundAPIService.getSupplyRate().subscribe((result) => {
          this.interestRate = result;
        });
      })
      .then(() => {
        this.getUSDCBalance();
      })
      .then(async () => {
        const isAccountExists = await this.defiDonationContractService.isAccountExists();
        if (isAccountExists) {
          this.getUSDCAllowance();
        }
      })
      .then(() => {
        this.isLoading = false;
      });
    });


  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.accountSubscription.unsubscribe();
  }

  onRight() {
    if (this.isLimit) {
      return;
    }
    this.currentPagenation++;
    this.reloadProject();
    this.checkLimit();
  }

  calculateDuedate(val: string, index: number) {
    if (isNaN(Number(val))) {
      return;
    }
    const monthlyInterest = this.underlyingBalance * this.interestRate / 12;

  //  this.dueDate = +val / monthlyInterest;
    this.dueDate = Math.floor(+val / monthlyInterest * 1000) * 0.001;
  }

  onLeft() {
    if (this.currentPagenation <= 0) {
      return;
    }
    this.currentPagenation--;
    this.reloadProject();
    this.checkLimit();
  }

  reloadProject() {
    this.projects = [];
    this.projects.push(this.projectsAll[this.currentPagenation]);
    this.projects.push(this.projectsAll[this.currentPagenation + 1]);
  }

  private checkLimit() {
    if (this.currentPagenation + 2 === this.projectsAll.length) {
      this.isLimit = true;
    } else {
      this.isLimit = false;
    }
  }

  createAccount() {
    this.defiDonationContractService.beReady().then(async () => {
      const result = await this.defiDonationContractService.createDonationAccount();
      console.log(result.transactionHash);
    });
  }

  checkDonationAccount() {
    return this.defiDonationContractService.beReady().then(async () => {
      try {
        this.defiDonationContractService.isAccountExists()
        .then((data) => {
          this.isAccountAvailable = data;
          if (data) {
            this.getUnderlyingBalance();
          }
        });
      } catch (e) {
        const delay = new Promise(resolve => setTimeout(resolve, 100));
        await delay;
        return await this.checkDonationAccount();
      }
    });
  }

  getUSDCBalance() {
    return this.usdcContractService.beReady().then(() => {
      this.usdcContractService.getBalance().then((data) => {
        this.usdcBalance = data;
      });
    });
  }

  getUSDCAllowance() {
    return this.usdcContractService.beReady().then(() => {
      this.defiDonationContractService.getDonationAccount().then((address) => {
        this.usdcContractService.getAllowance(address).then((data) => {
          this.usdcAllowanceBalance = data;
        });
      });
    });
  }

  approve() {
    this.usdcContractService.beReady().then(() => {
      this.defiDonationContractService.getDonationAccount().then((address) => {
        this.usdcContractService.approve(address, +this.donationForm.value.approveAmount).then((data) => {
          console.log(data);
        });
      });
   });

  }

  supply() {
    this.defiDonationContractService.beReady().then(async () => {
      try {
        const result = await this.defiDonationContractService.supply(+this.donationForm.value.supplyAmount);
        console.log(result);
      } catch (e) {
        const delay = new Promise(resolve => setTimeout(resolve, 100));
        await delay;
        return await this.supply();
      }
    });
  }

  /*redeem() {
    this.defiDonationContractService.beReady().then(async () => {
      try{
        let result = await this.defiDonationContractService.redeem(+this.donationForm.value.redeemAmount);
        console.log(result);
      } catch(e) {
        const delay = new Promise(resolve => setTimeout(resolve, 100));
        await delay;
        return await this.redeem();
      }
    });
  }*/



  getUnderlyingBalance() {
    this.defiDonationContractService.beReady().then(async () => {
      try {
        const result = await this.defiDonationContractService.getUnderlyingBalance();
        this.underlyingBalance = result;
      } catch (e) {
        const delay = new Promise(resolve => setTimeout(resolve, 100));
        await delay;
        return await this.getUnderlyingBalance();
      }
    });
  }
}
