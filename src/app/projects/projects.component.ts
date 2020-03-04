import { Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import { ProjectService } from './project.service';
import { Project } from './project.model';
import { Subscription } from 'rxjs';
import { DataStorageService } from '../shared/data-storage.service';
import { Web3Service } from '../shared/web3.service';
import { DeFiDonationContractService } from '../shared/defidonation-contract.service';
import { USDCContractService } from '../shared/usdc-contract.service';
import { NgForm } from '@angular/forms';
import { CompoundAPIService } from '../shared/compound-api.service';
import { UserProject } from './user-project.model';
import { UserProjectService } from './user-project.service';
import { ProcessingSpinnerComponent } from '../shared/processing-spinner/processing-spinner.component';

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
  intendedProjects: {name: string, id: string, amount: number, address: string}[] = [];
  isDonatedList: number[] = [];
  isProcessing = false;
  donationAccountAddress: string;
  interestRateSubscription: Subscription;
  defaultErrorMessage = 'エラーが発生しました。ネットワーク環境や、メタマスクの設定を確認してください!';
  errorMessage = this.defaultErrorMessage;
  isError = false;
  @ViewChild('donationForm', { static: false }) donationForm: NgForm;
  @ViewChild('addDonationForm', { static: false }) addDonationForm: NgForm;

  constructor(
    private projectService: ProjectService,
    private dataStorageService: DataStorageService,
    private defiDonationContractService: DeFiDonationContractService,
    private usdcContractService: USDCContractService,
    private compoundAPIService: CompoundAPIService,
    private web3Service: Web3Service,
    private userProjectService: UserProjectService
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
    this.initialize();

    this.accountSubscription = this.web3Service.accountsObservable.subscribe(() => {
      this.initialize();
    });

    this.interestRateSubscription = this.compoundAPIService.getSupplyRate('rinkeby').subscribe((result) => {
      this.interestRate = result;
    });

  }

  initialize() {
    this.defiDonationContractService.initialize()
    .then(async () => {
      await this.usdcContractService.initialize();
    })
    .then(async () => {
      await this.defiDonationContractService.setDonationAccount();
    })
    .then(() => {
      this.checkDonationAccount();
    })
    .then(() => {
      this.getUSDCBalance();
    })
    .then(async () => {
      const isAccountExists = await this.defiDonationContractService.isAccountExists();
      if (isAccountExists) {
        this.getDonationAccount();
        this.getUSDCAllowance();
      }
    })
    .then(() => {
      this.getIntendedProjects();
    })
    .then(() => {
      this.isLoading = false;
    });

  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.accountSubscription.unsubscribe();
    this.interestRateSubscription.unsubscribe();
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
    this.dueDate = +val / monthlyInterest;
  }

  onLeft() {
    if (this.currentPagenation <= 0) {
      return;
    }
    this.currentPagenation--;
    this.reloadProject();
    this.checkLimit();
  }

  getDonationAccount() {
    this.defiDonationContractService.beReady().then(() => {
      this.defiDonationContractService.getDonationAccount().then((data) => {
        this.donationAccountAddress = data;
      });
    });
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

  getIntendedProjects() {
    this.dataStorageService.fetchUserProjects(this.web3Service.getSelectedAddress()).subscribe((result) => {
      const projects = this.projectService.getProjects();
      this.intendedProjects = [];
      result.forEach(intendedProject => {
        projects.forEach(project => {
          if (intendedProject.projectAddress === project.address) {
            this.intendedProjects.push(
              {
                name: project.name,
                id: intendedProject.id,
                amount: intendedProject.amount,
                address: project.address
              }
              );
         }
        });
      });

      if (this.intendedProjects.length === 0) {
        this.isDonatedList[0] = null;
        this.isDonatedList[1] = null;
      }

      this.projects.forEach( (diplayedProject, index) => {
        for (const intendedProject of this.intendedProjects) {
          if (diplayedProject.address === intendedProject.address) {
            this.isDonatedList[index] = intendedProject.amount;
            break;
          } else {
            this.isDonatedList[index] = null;
          }
        }
      });
    });
  }

  createAccount() {
    this.isProcessing = true;
    this.defiDonationContractService.beReady().then( () => {
      this.defiDonationContractService.createDonationAccount().then( (result) => {
        console.log(result.transactionHash);
        this.initialize();
        this.isProcessing = false;
      });
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
    this.usdcContractService.beReady().then(() => {
      this.usdcContractService.getBalance().then((data) => {
        this.usdcBalance = data;
      });
    });
  }

  getUSDCAllowance() {
    this.usdcContractService.beReady().then(() => {
      this.defiDonationContractService.getDonationAccount().then((address) => {
        this.usdcContractService.getAllowance(address).then((data) => {
          this.usdcAllowanceBalance = data;
        });
      });
    });
  }

  approve() {
    const amount = +this.donationForm.value.approveAmount;
    this.isProcessing = true;
    this.usdcContractService.beReady().then(() => {
      this.defiDonationContractService.getDonationAccount().then(async (address) => {
        await this.usdcContractService.approve(address, amount);
        await this.getUSDCAllowance();
        this.isProcessing = false;
        this.donationForm.reset();
      });
   });

  }

  supply() {
    this.isProcessing = true;
    this.defiDonationContractService.beReady().then(async () => {
      try {
        const result = await this.defiDonationContractService.supply(
          +this.donationForm.value.supplyAmount,
          this.usdcContractService.decimals
          );
        this.getUSDCBalance();
        this.getUSDCAllowance();
        this.getUnderlyingBalance();
        this.isProcessing = false;
        this.donationForm.reset();
      } catch (e) {
        const delay = new Promise(resolve => setTimeout(resolve, 100));
        await delay;
        return await this.supply();
      }
    });
  }

  redeem() {
    this.isProcessing = true;
    this.defiDonationContractService.beReady().then(async () => {
      try {
        const result = await this.defiDonationContractService.redeem(
          +this.donationForm.value.redeemAmount,
          this.usdcContractService.decimals
          );
        this.getUnderlyingBalance();
        this.getUSDCBalance();
        this.isProcessing = false;
        this.donationForm.reset();
      } catch (e) {
        const delay = new Promise(resolve => setTimeout(resolve, 100));
        await delay;
        return await this.redeem();
      }
    });
  }

  getUnderlyingBalance() {
    this.defiDonationContractService.beReady().then(async () => {
      try {
        const result = await this.defiDonationContractService.getUnderlyingBalance(this.usdcContractService.decimals);
        this.underlyingBalance = +result;
      } catch (e) {
        const delay = new Promise(resolve => setTimeout(resolve, 100));
        await delay;
        return await this.getUnderlyingBalance();
      }
    });
  }

  reloadDepositBalance() {
    this.isProcessing = true;
    setTimeout(async () => {
      await this.getUnderlyingBalance();
      this.isProcessing = false;
    }, 500);
  }

  addDonateProject(_index: number) {
    this.isProcessing = true;
    const amount = +this.addDonationForm.value['donateAmount' + _index];
    this.defiDonationContractService.beReady().then(async () => {
      try {
        const userProject = new UserProject(this.web3Service.getSelectedAddress(), amount , this.projects[_index].address, '', 0);
        const result = await this.defiDonationContractService.addDonateProject(
          this.projects[_index].address,
          amount,
          this.usdcContractService.decimals
          );
        this.dataStorageService.saveUserProject(userProject).subscribe(
          (response) => {
            userProject.id = response.name;
            this.userProjectService.addUserProject(userProject);
            this.getIntendedProjects();
            this.isProcessing = false;
            this.addDonationForm.reset();
            this.dueDate = null;
          }
        );

     } catch (e) {
        const delay = new Promise(resolve => setTimeout(resolve, 100));
        await delay;
        return await this.supply();
      }
    });

  }

  executeDonateProject(_index: number) {
    this.isProcessing = true;
    this.defiDonationContractService.beReady().then(async () => {
      try {
        const result = await this.defiDonationContractService.donate(this.projects[_index].address);
        console.log(result);

        const userProjects = this.userProjectService.getUserProjects();
        let index: string;

        let deleteObj: {[key: string]: UserProject};
        userProjects.forEach((element) => {
          if (element.projectAddress === this.projects[_index].address) {
            index = element.id;
            element.delFlg = 1;
            deleteObj = {[index]: element};
          }
        });

        this.dataStorageService.deleteSpecificUserProject(deleteObj).subscribe(() => {
          this.userProjectService.deleteUserProject(index);
          this.getIntendedProjects();
          this.getUnderlyingBalance();
          this.isProcessing = false;
        });
      } catch (e) {
        const delay = new Promise(resolve => setTimeout(resolve, 100));
        await delay;
        return await this.supply();
      }
    });


  }

}
