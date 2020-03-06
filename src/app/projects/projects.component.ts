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
import { Const } from '../shared/const';

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
    this.defiDonationContractService.setDonationAccount()
    .then(async () => {
      await this.storeAccountAvailable();
    })
    .then(async () => {
      if (this.isAccountAvailable) {
        Promise.all([
          this.storeUSDCBalance(),
          this.storeUnderlyingBalance(),
          this.storeDonationAccount(),
          this.storeUSDCAllowance(),
          this.getIntendedProjects(),
        ]);
     }
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

  onLeft() {
    if (this.currentPagenation <= 0) {
      return;
    }
    this.currentPagenation--;
    this.reloadProject();
    this.checkLimit();
  }

  calculateDuedate(val: string) {
    if (isNaN(Number(val))) {
      return;
    }
    const monthlyInterest = this.underlyingBalance * this.interestRate / 12;
    this.dueDate = +val / monthlyInterest;
  }

  async storeDonationAccount() {
    try {
      this.donationAccountAddress = await this.defiDonationContractService.getDonationAccount();
    } catch (e) {
      this.isError = true;
    }
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
      this.intendedProjects = [];
      result.forEach(intendedProject => {
        this.projectsAll.forEach(project => {
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
      this.createDonatedList();
    });

  }

  private createDonatedList() {
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
  }

  async createAccount() {
    this.isProcessing = true;
    try {
      await this.defiDonationContractService.createDonationAccount();
      this.initialize();
     } catch (e) {
      this.analyzeErrorOrNot(e.message);
    } finally {
      this.isProcessing = false;
    }
  }


  async storeAccountAvailable() {
    try {
      this.isAccountAvailable = await this.defiDonationContractService.isAccountExists();
    } catch (e) {
      this.isError = true;
    }
  }

  async storeUSDCBalance() {
    try {
      this.usdcBalance = await this.usdcContractService.getBalance();
    } catch (e) {
      this.isError = true;
    }
  }

  async storeUSDCAllowance() {
    try {
      const address = await this.defiDonationContractService.getDonationAccount();
      this.usdcAllowanceBalance = await this.usdcContractService.getAllowance(address);
    } catch (e) {
      this.isError = true;
    }
  }

  async approve() {
    const amount = +this.donationForm.value.approveAmount;
    this.isProcessing = true;
    try {
      const address = await this.defiDonationContractService.getDonationAccount();
      await this.usdcContractService.approve(address, amount);
      await this.storeUSDCAllowance();
      this.donationForm.reset();
    } catch (e) {
      this.analyzeErrorOrNot(e.message);
    } finally {
      this.isProcessing = false;
    }
  }

  private analyzeErrorOrNot(message: string) {
    if (!message.includes(Const.METAMASK_CANCEL)) {
      this.isError = true;
    }
  }

  async supply() {
    this.isProcessing = true;
    try {
      await this.defiDonationContractService.supply(
        +this.donationForm.value.supplyAmount,
        this.usdcContractService.decimals
        );
      Promise.all([
        this.storeUSDCBalance(),
        this.storeUSDCAllowance(),
        this.storeUnderlyingBalance(),
      ]).then(() => {
        this.donationForm.reset();
      });
     } catch (e) {
      this.analyzeErrorOrNot(e.message);
    } finally {
      this.isProcessing = false;
    }
  }

  async redeem() {
    this.isProcessing = true;
    try {
      await this.defiDonationContractService.redeem(
        +this.donationForm.value.redeemAmount,
        this.usdcContractService.decimals
        );

      Promise.all([
        this.storeUSDCBalance(),
        this.storeUnderlyingBalance(),
      ]).then(() => {
        this.donationForm.reset();
      });
     } catch (e) {
      this.analyzeErrorOrNot(e.message);
    } finally {
      this.isProcessing = false;
    }
  }

  async storeUnderlyingBalance() {
    try {
      this.underlyingBalance = await this.defiDonationContractService.getUnderlyingBalance(this.usdcContractService.decimals);
    } catch (e) {
      this.isError = true;
    }
  }

  reloadDepositBalance() {
    this.isProcessing = true;
    setTimeout(async () => {
      try {
        await this.storeUnderlyingBalance();
      } catch (e) {
        this.isError = true;
      } finally {
        this.isProcessing = false;
      }
    }, 500);
  }

  async addDonateProject(_index: number) {
    this.isProcessing = true;
    const amount = +this.addDonationForm.value['donateAmount' + _index];
    try {
      const userProject = new UserProject(this.web3Service.getSelectedAddress(), amount , this.projects[_index].address, '', 0);
      await this.defiDonationContractService.addDonateProject(
        this.projects[_index].address,
        amount,
        this.usdcContractService.decimals
        );
      this.dataStorageService.saveUserProject(userProject).subscribe(
        (response) => {
          userProject.id = response.name;
          this.userProjectService.addUserProject(userProject);
          this.getIntendedProjects();
          this.addDonationForm.reset();
          this.dueDate = null;
        }
      );
    } catch (e) {
      this.analyzeErrorOrNot(e.message);
    } finally {
      this.isProcessing = false;
    }
  }

  async executeDonateProject(_index: number) {
    this.isProcessing = true;
    try {
      await this.defiDonationContractService.donate(this.projects[_index].address);

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
        this.storeUnderlyingBalance();
      });
    } catch (e) {
      this.analyzeErrorOrNot(e.message);
    } finally {
      this.isProcessing = false;
    }



  }

}
