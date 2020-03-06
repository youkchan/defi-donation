import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { ProjectsComponent } from './projects.component';
import { ProjectService } from './project.service';
import { DataStorageService } from '../shared/data-storage.service';
import { HttpClientModule } from '@angular/common/http';
import { Project } from './project.model';
import { LoadingSpinnerComponent } from '../shared/loading-spinner/loading-spinner.component';
import { BrowserModule, By } from '@angular/platform-browser';
import { FormsModule, NgForm } from '@angular/forms';
import { ProcessingSpinnerComponent } from '../shared/processing-spinner/processing-spinner.component';
import { DeFiDonationContractService } from '../shared/defidonation-contract.service';
import { USDCContractService } from '../shared/usdc-contract.service';
import { CompoundAPIService } from '../shared/compound-api.service';
import { Web3Service } from '../shared/web3.service';
import { UserProjectService } from './user-project.service';
import { resolve } from 'url';
import { Const } from '../shared/const';
import { of } from 'rxjs';
import { UserProject } from './user-project.model';



describe('ProjectsComponent', () => {
  let component: ProjectsComponent;
  let fixture: ComponentFixture<ProjectsComponent>;
  const expectedProjects: Project[] = [
    { address: 'YYYYYYYY', description: 'test description', name: 'test'  },
    { address: 'XXXXXXXX', description: 'test2 description', name: 'test2' },
    { address: 'AAAAAAAA', description: 'test3 description', name: 'test3'  },
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectsComponent, LoadingSpinnerComponent, ProcessingSpinnerComponent ],
      imports: [HttpClientModule, BrowserModule, FormsModule],
      providers: [
        ProjectService,
        DataStorageService,
        DeFiDonationContractService,
        USDCContractService,
        CompoundAPIService,
        Web3Service,
        UserProjectService
      ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectsComponent);
    component = fixture.debugElement.componentInstance;
    component.projects = expectedProjects.slice().splice(0, 2);
    component.projectsAll = expectedProjects;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onRight', () => {
    (component as any).onRight();
    expect(component.projects[0]).toEqual(expectedProjects[1]);
    expect(component.projects[1]).toEqual(expectedProjects[2]);
  });

  it('onRight nothing will do when a position is right end', () => {
    component.isLimit = true;
    (component as any).onRight();
    expect(component.projects[0]).toEqual(expectedProjects[0]);
    expect(component.projects[1]).toEqual(expectedProjects[1]);
  });

  it('onLeft', () => {
    component.currentPagenation = 1;
    component.reloadProject();
    (component as any).onLeft();
    expect(component.projects[0]).toEqual(expectedProjects[0]);
    expect(component.projects[1]).toEqual(expectedProjects[1]);
  });

  it('onLeft nothing will do when a position is zero', () => {
    component.currentPagenation = 0;
    component.reloadProject();
    (component as any).onLeft();
    expect(component.projects[0]).toEqual(expectedProjects[0]);
    expect(component.projects[1]).toEqual(expectedProjects[1]);
  });

  it('reloadProject', () => {
    component.currentPagenation = 1;
    component.reloadProject();
    expect(component.projects[0]).toEqual(expectedProjects[1]);
    expect(component.projects[1]).toEqual(expectedProjects[2]);
  });

  it('storeUSDCAllowance', async (done) => {
    const defiDonationContractService = fixture.debugElement.injector.get(DeFiDonationContractService);
    const usdcContractService = fixture.debugElement.injector.get(USDCContractService);
    const expectedBalance = 10;

    spyOn(defiDonationContractService, 'getDonationAccount').and.returnValue(Promise.resolve('0x8225Afb2C5A6A68525E22A7E237BcE1600A665f5'));
    spyOn(usdcContractService, 'getAllowance').and.returnValue(Promise.resolve(expectedBalance));
    fixture.detectChanges();
    await component.storeUSDCAllowance();
    expect(expectedBalance).toEqual(component.usdcAllowanceBalance);
    done();
  });

  it('storeUSDCAllowance error', async (done) => {
    const defiDonationContractService = fixture.debugElement.injector.get(DeFiDonationContractService);
    const usdcContractService = fixture.debugElement.injector.get(USDCContractService);
    const expectedBalance = 10;

    spyOn(defiDonationContractService, 'getDonationAccount').and.returnValue(Promise.resolve('0x8225Afb2C5A6A68525E22A7E237BcE1600A665f5'));
    spyOn(usdcContractService, 'getAllowance').and.callFake(() => {throw new Error('Some Error is occured!'); });
    fixture.detectChanges();
    await component.storeUSDCAllowance();
    expect(expectedBalance).not.toEqual(component.usdcAllowanceBalance);
    expect(true).toEqual(component.isError);
    done();
  });

  it('storeUSDCbalance', async (done) => {
    const usdcContractService = fixture.debugElement.injector.get(USDCContractService);
    const expectedBalance = 100;

    spyOn(usdcContractService, 'getBalance').and.returnValue(Promise.resolve(expectedBalance));
    fixture.detectChanges();
    await component.storeUSDCBalance();
    expect(expectedBalance).toEqual(component.usdcBalance);
    done();
  });

  it('storeUSDCbalance error', async (done) => {
    const usdcContractService = fixture.debugElement.injector.get(USDCContractService);
    const expectedBalance = 100;

    spyOn(usdcContractService, 'getBalance').and.callFake(() => {throw new Error('Some Error is occured!'); });
    fixture.detectChanges();
    await component.storeUSDCBalance();
    expect(expectedBalance).not.toEqual(component.usdcBalance);
    expect(true).toEqual(component.isError);
    done();
  });

  it('storeDonationAccount', async (done) => {
    const expectedAddress = '0x8225Afb2C5A6A68525E22A7E237BcE1600A665f5';
    const defiDonationContractService = fixture.debugElement.injector.get(DeFiDonationContractService);

    spyOn(defiDonationContractService, 'getDonationAccount').and.returnValue(Promise.resolve(expectedAddress));

    fixture.detectChanges();
    await component.storeDonationAccount();
    expect(expectedAddress).toEqual(component.donationAccountAddress);
    done();
  });

  it('storeDonationAccount error', async (done) => {
    const expectedAddress = '0x8225Afb2C5A6A68525E22A7E237BcE1600A665f5';
    const defiDonationContractService = fixture.debugElement.injector.get(DeFiDonationContractService);

    spyOn(defiDonationContractService, 'getDonationAccount').and.callFake(() => {throw new Error('Some Error is occured!'); });

    fixture.detectChanges();
    await component.storeDonationAccount();
    expect(expectedAddress).not.toEqual(component.donationAccountAddress);
    expect(true).toEqual(component.isError);
    done();
  });

  it('calculateDuedate input is not number', () => {
    expect((component as any).calculateDuedate('test')).toBeUndefined();
  });

  it('calculateDuedate ', () => {
    const interestRate = 0.5;
    const underlyingBalance = 1000;
    const input = '10';
    const expectAmount = +input / (underlyingBalance * interestRate / 12);
    component.underlyingBalance = underlyingBalance;
    component.interestRate = interestRate;
    (component as any).calculateDuedate(input);
    expect(expectAmount).toEqual(component.dueDate);
  });

  it('analyzeErrorOrNot metamask cancel', () => {
    expect(component.isError).toBeFalsy();
    (component as any).analyzeErrorOrNot(Const.METAMASK_CANCEL);
    expect(component.isError).toBeFalsy();
  });

  it('analyzeErrorOrNot ', () => {
    expect(component.isError).toBeFalsy();
    (component as any).analyzeErrorOrNot('Some Error is occured!');
    expect(component.isError).toBeTruthy();
  });

  it('approve', fakeAsync (() => {
    const defiDonationContractService = fixture.debugElement.injector.get(DeFiDonationContractService);
    const usdcContractService = fixture.debugElement.injector.get(USDCContractService);
    spyOn(usdcContractService, 'approve');
    spyOn(defiDonationContractService, 'getDonationAccount').and.returnValue(Promise.resolve('0x8225Afb2C5A6A68525E22A7E237BcE1600A665f5'));
    spyOn<any>(component, 'storeUSDCAllowance');
    component.isLoading = false;
    component.isProcessing = false;
    component.isAccountAvailable = true;
    fixture.detectChanges();
    tick();
    const element = fixture.debugElement.nativeElement.querySelector('input[name=approveAmount]');
    element.value = '1000';
    element.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    component.approve();
    tick();
    fixture.detectChanges();
    const elementAfter = fixture.debugElement.nativeElement.querySelector('input[name=approveAmount]');
    expect('').toEqual(elementAfter.value);
  }));

  it('approve error', fakeAsync (() => {
    const defiDonationContractService = fixture.debugElement.injector.get(DeFiDonationContractService);
    const usdcContractService = fixture.debugElement.injector.get(USDCContractService);
    spyOn(defiDonationContractService, 'getDonationAccount').and.returnValue(Promise.resolve('0x8225Afb2C5A6A68525E22A7E237BcE1600A665f5'));
    const approve = spyOn<any>(usdcContractService, 'approve').and.callFake(() => {throw new Error('Some Error is occured!'); });
    spyOn<any>(component, 'storeUSDCAllowance');
    component.isLoading = false;
    component.isProcessing = false;
    component.isAccountAvailable = true;
    fixture.detectChanges();
    tick();
    const element = fixture.debugElement.nativeElement.querySelector('input[name=approveAmount]');
    element.value = '1000';
    element.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    component.approve();
    tick();
    expect(component.isError).toBeTruthy();
    expect(approve).toHaveBeenCalledWith('0x8225Afb2C5A6A68525E22A7E237BcE1600A665f5', 1000);
  }));

  it('supply', fakeAsync (() => {
    const defiDonationContractService = fixture.debugElement.injector.get(DeFiDonationContractService);
    const usdcContractService = fixture.debugElement.injector.get(USDCContractService);
    spyOn(defiDonationContractService, 'supply');
    spyOn<any>(component, 'storeUSDCAllowance');
    spyOn<any>(component, 'storeUSDCBalance');
    spyOn<any>(component, 'storeUnderlyingBalance');
    component.isLoading = false;
    component.isProcessing = false;
    component.isAccountAvailable = true;

    spyOn(usdcContractService, 'getDecimals').and.returnValue(Promise.resolve(6));
    fixture.detectChanges();
    tick();
    const element = fixture.debugElement.nativeElement.querySelector('input[name=supplyAmount]');
    element.value = '10000';
    element.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    component.supply();
    tick();
    fixture.detectChanges();
    const elementAfter = fixture.debugElement.nativeElement.querySelector('input[name=supplyAmount]');
    expect('').toEqual(elementAfter.value);
  }));


  it('supply error', fakeAsync (() => {
    const defiDonationContractService = fixture.debugElement.injector.get(DeFiDonationContractService);
    const usdcContractService = fixture.debugElement.injector.get(USDCContractService);
    const approve = spyOn<any>(defiDonationContractService, 'supply').and.callFake(() => {throw new Error('Some Error is occured!'); });
    spyOn<any>(component, 'storeUSDCAllowance');
    spyOn<any>(component, 'storeUSDCBalance');
    spyOn<any>(component, 'storeUnderlyingBalance');
    component.isLoading = false;
    component.isProcessing = false;
    component.isAccountAvailable = true;

    spyOn(usdcContractService, 'getDecimals').and.returnValue(Promise.resolve(6));
    fixture.detectChanges();
    tick();
    const element = fixture.debugElement.nativeElement.querySelector('input[name=supplyAmount]');
    element.value = '10000';
    element.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    component.supply();
    tick();
    expect(component.isError).toBeTruthy();
    expect(approve).toHaveBeenCalledWith(10000, 6);
  }));

  it('redeem', fakeAsync (() => {
    const defiDonationContractService = fixture.debugElement.injector.get(DeFiDonationContractService);
    const usdcContractService = fixture.debugElement.injector.get(USDCContractService);
    spyOn(defiDonationContractService, 'redeem');
    spyOn<any>(component, 'storeUSDCBalance');
    spyOn<any>(component, 'storeUnderlyingBalance');
    component.isLoading = false;
    component.isProcessing = false;
    component.isAccountAvailable = true;

    spyOn(usdcContractService, 'getDecimals').and.returnValue(Promise.resolve(6));
    fixture.detectChanges();
    tick();
    const element = fixture.debugElement.nativeElement.querySelector('input[name=redeemAmount]');
    element.value = '10000';
    element.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    component.redeem();
    tick();
    fixture.detectChanges();
    const elementAfter = fixture.debugElement.nativeElement.querySelector('input[name=redeemAmount]');
    expect('').toEqual(elementAfter.value);
  }));

  it('redeem error', fakeAsync (() => {
    const defiDonationContractService = fixture.debugElement.injector.get(DeFiDonationContractService);
    const usdcContractService = fixture.debugElement.injector.get(USDCContractService);
    const approve = spyOn<any>(defiDonationContractService, 'redeem').and.callFake(() => {throw new Error('Some Error is occured!'); });
    spyOn<any>(component, 'storeUSDCBalance');
    spyOn<any>(component, 'storeUnderlyingBalance');
    component.isLoading = false;
    component.isProcessing = false;
    component.isAccountAvailable = true;

    spyOn(usdcContractService, 'getDecimals').and.returnValue(Promise.resolve(6));
    fixture.detectChanges();
    tick();
    const element = fixture.debugElement.nativeElement.querySelector('input[name=redeemAmount]');
    element.value = '50000';
    element.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    component.redeem();
    tick();
    fixture.detectChanges();
    expect(component.isError).toBeTruthy();
    expect(approve).toHaveBeenCalledWith(50000, 6);
  }));

  it('storeUnderlyingBalance', async (done) => {
    const expectedBalance = 1000;
    const defiDonationContractService = fixture.debugElement.injector.get(DeFiDonationContractService);
    const usdcContractService = fixture.debugElement.injector.get(USDCContractService);

    spyOn(usdcContractService, 'getDecimals').and.returnValue(Promise.resolve(6));

    spyOn(defiDonationContractService, 'getUnderlyingBalance').and.returnValue(Promise.resolve(expectedBalance));

    fixture.detectChanges();
    await component.storeUnderlyingBalance();
    expect(expectedBalance).toEqual(component.underlyingBalance);
    done();
  });

  it('storeUnderlyingBalance error', async (done) => {
    const expectedBalance = 1000;
    const defiDonationContractService = fixture.debugElement.injector.get(DeFiDonationContractService);
    const usdcContractService = fixture.debugElement.injector.get(USDCContractService);
    spyOn(usdcContractService, 'getDecimals').and.returnValue(Promise.resolve(6));

    spyOn(defiDonationContractService, 'getUnderlyingBalance').and.callFake(() => {throw new Error('Some Error is occured!'); });

    fixture.detectChanges();
    await component.storeUnderlyingBalance();
    expect(expectedBalance).not.toEqual(component.underlyingBalance);
    expect(true).toEqual(component.isError);
    done();
  });

  it('createAccount error', fakeAsync (() => {
    const defiDonationContractService = fixture.debugElement.injector.get(DeFiDonationContractService);
    const usdcContractService = fixture.debugElement.injector.get(USDCContractService);
    const approve = spyOn(defiDonationContractService, 'createDonationAccount')
      .and.callFake(() => {throw new Error('Some Error is occured!'); });
    spyOn<any>(component, 'initialize');
    component.isLoading = false;
    component.isProcessing = false;
    component.isAccountAvailable = false;
    fixture.detectChanges();
    tick();

    component.createAccount();
    tick();
    fixture.detectChanges();
    expect(component.isError).toBeTruthy();
    expect(approve).toHaveBeenCalledWith();
  }));

  it('storeAccountAvailable', async (done) => {
    const defiDonationContractService = fixture.debugElement.injector.get(DeFiDonationContractService);

    spyOn(defiDonationContractService, 'isAccountExists').and.returnValue(Promise.resolve(true));

    fixture.detectChanges();
    await component.storeAccountAvailable();
    expect(true).toEqual(component.isAccountAvailable);
    done();
  });


  it('storeAccountAvailable error', async (done) => {
    const defiDonationContractService = fixture.debugElement.injector.get(DeFiDonationContractService);

    spyOn(defiDonationContractService, 'isAccountExists').and.callFake(() => {throw new Error('Some Error is occured!'); });
    fixture.detectChanges();
    await component.storeAccountAvailable();
    expect(component.isError).toBeTruthy();
    done();
  });


  it('createDonatedList noIntendedProjects', () => {
    component.intendedProjects = [];
    (component as any).createDonatedList();
    expect(component.isDonatedList[0]).toBeNull();
    expect(component.isDonatedList[1]).toBeNull();
  });

  it('createDonatedList', () => {
    component.intendedProjects = [
      {name: 'Test Project1', id: 'XXXXXXX', amount: 10, address: 'YYYYYYYYY'},
      {name: 'Test Project2', id: 'AAAAAAA', amount: 20, address: 'ZZZZZZZZZ'},
    ];

    component.projects = [
      {name: 'Test Project3', description: 'Test Project3 Description', address: 'AAAAAAAAA'},
      {name: 'Test Project1', description: 'Test Project1 Description', address: 'YYYYYYYYY'},
    ];

    (component as any).createDonatedList();
    expect(component.isDonatedList[0]).toBeNull();
    expect(component.isDonatedList[1]).toEqual(10);
  });

  it('getIntendedProjects', fakeAsync(() => {
    const userProjects: UserProject[] = [
      {userAddress: 'XXXXXXXX', amount: 100, projectAddress: 'YYYYYYY', id: 'id1', delFlg: 0},
      {userAddress: 'XXXXXXXX', amount: 200, projectAddress: 'ZZZZZZZ', id: 'id2', delFlg: 0},
    ];

    component.projectsAll = [
      {name: 'Test Project3', description: 'Test Project3 Description', address: 'YYYYYYY'},
      {name: 'Test Project1', description: 'Test Project1 Description', address: 'AAAAAAA'},
      {name: 'Test Project2', description: 'Test Project2 Description', address: 'ZZZZZZZ'},
      {name: 'Test Project4', description: 'Test Project4 Description', address: 'BBBBBBB'},
    ];

    const expectIntendedProjects = [
      {name: 'Test Project3', id: 'id1', amount: 100, address: 'YYYYYYY'},
      {name: 'Test Project2', id: 'id2', amount: 200, address: 'ZZZZZZZ'}
    ];

    spyOn((component as any).web3Service, 'getSelectedAddress').and.returnValue('0x8225Afb2C5A6A68525E22A7E237BcE1600A665f5');

    const dataStorageService = fixture.debugElement.injector.get(DataStorageService);
    spyOn(dataStorageService, 'fetchUserProjects').and.returnValue(of(userProjects));
    fixture.detectChanges();
    component.getIntendedProjects();
    tick();
    expect(expectIntendedProjects).toEqual(component.intendedProjects);
  }));


  it('reloadDepositBalance error', fakeAsync (() => {
    spyOn(component, 'storeUnderlyingBalance').and.callFake(() => {throw new Error('Some Error is occured!'); });
    fixture.detectChanges();
    tick();
    component.reloadDepositBalance();
    tick(500);
    fixture.detectChanges();
    expect(component.isError).toBeTruthy();
    expect(component.isProcessing).toBeFalsy();
  }));

  it('addDonateProject', fakeAsync (() => {
    const defiDonationContractService = fixture.debugElement.injector.get(DeFiDonationContractService);
    const usdcContractService = fixture.debugElement.injector.get(USDCContractService);
    const dataStorageService = fixture.debugElement.injector.get(DataStorageService);
    const userProjectService = fixture.debugElement.injector.get(UserProjectService);

    component.projects = [
      {name: 'Test Project3', description: 'Test Project3 Description', address: 'YYYYYYY'},
      {name: 'Test Project1', description: 'Test Project1 Description', address: 'AAAAAAA'},
    ];
    const index = 0;
    const expectAmount = '20000';
    const expectUserProject = new UserProject(
      '0x8225Afb2C5A6A68525E22A7E237BcE1600A665f5',
       +expectAmount,
       component.projects[index].address,
       'id',
       0
       );

    spyOn(defiDonationContractService, 'addDonateProject');
    spyOn<any>(component, 'getIntendedProjects');
    spyOn((component as any).web3Service, 'getSelectedAddress').and.returnValue('0x8225Afb2C5A6A68525E22A7E237BcE1600A665f5');
    spyOn(dataStorageService, 'saveUserProject').and.returnValue(of({name: 'id'}));
    component.isLoading = false;
    component.isProcessing = false;
    component.isAccountAvailable = true;

    spyOn(usdcContractService, 'getDecimals').and.returnValue(Promise.resolve(6));
    fixture.detectChanges();
    tick();
    const element = fixture.debugElement.nativeElement.querySelector('input[ng-reflect-name=donateAmount0]');
    element.value = expectAmount;
    element.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    component.addDonateProject(index);
    tick();
    fixture.detectChanges();
    expect([expectUserProject]).toEqual(userProjectService.getUserProjects());
  }));


  it('addDonateProject error', fakeAsync (() => {
    const defiDonationContractService = fixture.debugElement.injector.get(DeFiDonationContractService);
    const usdcContractService = fixture.debugElement.injector.get(USDCContractService);
    const dataStorageService = fixture.debugElement.injector.get(DataStorageService);
    const userProjectService = fixture.debugElement.injector.get(UserProjectService);

    component.projects = [
      {name: 'Test Project3', description: 'Test Project3 Description', address: 'YYYYYYY'},
      {name: 'Test Project1', description: 'Test Project1 Description', address: 'AAAAAAA'},
    ];
    const index = 0;
    const expectAmount = '20000';
    const expectUserProject = new UserProject(
      '0x8225Afb2C5A6A68525E22A7E237BcE1600A665f5',
       +expectAmount,
       component.projects[index].address,
       'id',
       0
       );

    spyOn(defiDonationContractService, 'addDonateProject').and.callFake(() => {throw new Error('Some Error is occured!'); });
    spyOn<any>(component, 'getIntendedProjects');
    spyOn((component as any).web3Service, 'getSelectedAddress').and.returnValue('0x8225Afb2C5A6A68525E22A7E237BcE1600A665f5');
    spyOn(dataStorageService, 'saveUserProject').and.returnValue(of({name: 'id'}));
    component.isLoading = false;
    component.isProcessing = false;
    component.isAccountAvailable = true;

    spyOn(usdcContractService, 'getDecimals').and.returnValue(Promise.resolve(6));
    fixture.detectChanges();
    tick();
    const element = fixture.debugElement.nativeElement.querySelector('input[ng-reflect-name=donateAmount0]');
    element.value = expectAmount;
    element.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    component.addDonateProject(index);
    tick();
    fixture.detectChanges();
    expect(component.isError).toBeTruthy();
  }));


  it('executeDonateProject', fakeAsync (() => {
    const defiDonationContractService = fixture.debugElement.injector.get(DeFiDonationContractService);
    const usdcContractService = fixture.debugElement.injector.get(USDCContractService);
    const dataStorageService = fixture.debugElement.injector.get(DataStorageService);
    const userProjectService = fixture.debugElement.injector.get(UserProjectService);

    component.projects = [
      {name: 'Test Project3', description: 'Test Project3 Description', address: 'YYYYYYY'},
      {name: 'Test Project1', description: 'Test Project1 Description', address: 'AAAAAAA'},
    ];
    const index = 0;
    const expectAmount = '20000';
    const expectUserProject1 = new UserProject(
      '0x8225Afb2C5A6A68525E22A7E237BcE1600A665f5',
       +expectAmount,
       component.projects[index].address,
       'id',
       0
       );

    const expectUserProject2 = new UserProject(
      '0x8225Afb2C5A6A68525E22A7E237BcE1600A665f5',
       +expectAmount,
       component.projects[index + 1].address,
       'id2',
       0
       );

    spyOn(defiDonationContractService, 'donate');
    userProjectService.setUserProjects([expectUserProject1, expectUserProject2]);
    spyOn<any>(component, 'getIntendedProjects');
    spyOn<any>(component, 'storeUnderlyingBalance');
    spyOn(dataStorageService, 'deleteSpecificUserProject').and.returnValue(of('result'));
    component.isLoading = false;
    component.isProcessing = false;
    component.isAccountAvailable = true;

    spyOn(usdcContractService, 'getDecimals').and.returnValue(Promise.resolve(6));
    fixture.detectChanges();
    tick();
    component.executeDonateProject(index);
    tick();
    fixture.detectChanges();
    expect([expectUserProject2]).toEqual(userProjectService.getUserProjects());
  }));

  it('executeDonateProject', fakeAsync (() => {
    const defiDonationContractService = fixture.debugElement.injector.get(DeFiDonationContractService);
    const usdcContractService = fixture.debugElement.injector.get(USDCContractService);
    const dataStorageService = fixture.debugElement.injector.get(DataStorageService);
    const userProjectService = fixture.debugElement.injector.get(UserProjectService);

    component.projects = [
      {name: 'Test Project3', description: 'Test Project3 Description', address: 'YYYYYYY'},
      {name: 'Test Project1', description: 'Test Project1 Description', address: 'AAAAAAA'},
    ];
    const index = 0;
    const expectAmount = '20000';
    const expectUserProject1 = new UserProject(
      '0x8225Afb2C5A6A68525E22A7E237BcE1600A665f5',
       +expectAmount,
       component.projects[index].address,
       'id',
       0
       );

    spyOn(defiDonationContractService, 'donate').and.callFake(() => {throw new Error('Some Error is occured!'); });
    userProjectService.setUserProjects([expectUserProject1]);
    spyOn<any>(component, 'getIntendedProjects');
    spyOn<any>(component, 'storeUnderlyingBalance');
    spyOn(dataStorageService, 'deleteSpecificUserProject').and.returnValue(of('result'));
    component.isLoading = false;
    component.isProcessing = false;
    component.isAccountAvailable = true;

    spyOn(usdcContractService, 'getDecimals').and.returnValue(Promise.resolve(6));
    fixture.detectChanges();
    tick();
    component.executeDonateProject(index);
    tick();
    fixture.detectChanges();
    expect(component.isError).toBeTruthy();
  }));



});
