import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsComponent } from './projects.component';
import { ProjectService } from './project.service';
import { DataStorageService } from '../shared/data-storage.service';
import { HttpClientModule } from '@angular/common/http';
import { Project } from './project.model';
import { LoadingSpinnerComponent } from '../shared/loading-spinner/loading-spinner.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ProcessingSpinnerComponent } from '../shared/processing-spinner/processing-spinner.component';
import { DeFiDonationContractService } from '../shared/defidonation-contract.service';
import { USDCContractService } from '../shared/usdc-contract.service';
import { CompoundAPIService } from '../shared/compound-api.service';
import { Web3Service } from '../shared/web3.service';
import { UserProjectService } from './user-project.service';



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
    component.onRight();
    expect(component.projects[0]).toEqual(expectedProjects[1]);
    expect(component.projects[1]).toEqual(expectedProjects[2]);
  });

  it('onRight nothing will do when a position is right end', () => {
    component.isLimit = true;
    component.onRight();
    expect(component.projects[0]).toEqual(expectedProjects[0]);
    expect(component.projects[1]).toEqual(expectedProjects[1]);
  });

  it('onLeft', () => {
    component.currentPagenation = 1;
    component.reloadProject();
    component.onLeft();
    expect(component.projects[0]).toEqual(expectedProjects[0]);
    expect(component.projects[1]).toEqual(expectedProjects[1]);
  });

  it('onLeft nothing will do when a position is zero', () => {
    component.currentPagenation = 0;
    component.reloadProject();
    component.onLeft();
    expect(component.projects[0]).toEqual(expectedProjects[0]);
    expect(component.projects[1]).toEqual(expectedProjects[1]);
  });

  it('reloadProject', () => {
    component.currentPagenation = 1;
    component.reloadProject();
    expect(component.projects[0]).toEqual(expectedProjects[1]);
    expect(component.projects[1]).toEqual(expectedProjects[2]);
  });

});
