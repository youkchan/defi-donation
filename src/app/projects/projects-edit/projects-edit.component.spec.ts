import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsEditComponent } from './projects-edit.component';
import { ProjectService } from '../project.service';
import { Router } from '@angular/router';
import { DataStorageService } from '../../shared/data-storage.service';

describe('ProjectsEditComponent', () => {
  let component: ProjectsEditComponent;
  let fixture: ComponentFixture<ProjectsEditComponent>;
  let projectService: ProjectService;
  let router: Router;
  let dataStorageService: DataStorageService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectsEditComponent ],
       providers: [ ProjectService, Router, DataStorageService ]

    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectsEditComponent);
    projectService = TestBed.get(ProjectService);
    router = TestBed.get(Router);
    dataStorageService = TestBed.get(DataStorageService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

/*  it('should create', () => {
    expect(component).toBeTruthy();
  });*/
});
