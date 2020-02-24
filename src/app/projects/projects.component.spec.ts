import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsComponent } from './projects.component';
import { ProjectService } from './project.service';
import { DataStorageService } from '../shared/data-storage.service';
import { HttpClientModule } from '@angular/common/http';
import { Project } from './project.model';



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
      declarations: [ ProjectsComponent ],
      imports: [HttpClientModule],
      providers: [ProjectService, DataStorageService]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectsComponent);
    component = fixture.debugElement.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onRight', () => {
    const projectService = fixture.debugElement.injector.get(ProjectService);
    projectService.setProjects(expectedProjects);
    component.onRight();
    expect(component.projects[0]).toEqual(expectedProjects[1]);
    expect(component.projects[1]).toEqual(expectedProjects[2]);
  });

  it('onRight nothing will do when a position is right end', () => {
    const projectService = fixture.debugElement.injector.get(ProjectService);
    projectService.setProjects(expectedProjects);
    component.isLimit = true;
    component.onRight();
    expect(component.projects[0]).toEqual(expectedProjects[0]);
    expect(component.projects[1]).toEqual(expectedProjects[1]);
  });

  it('onLeft', () => {
    const projectService = fixture.debugElement.injector.get(ProjectService);
    projectService.setProjects(expectedProjects);
    component.currentPagenation = 1;

    component.reloadProject();
    component.onLeft();
    expect(component.projects[0]).toEqual(expectedProjects[0]);
    expect(component.projects[1]).toEqual(expectedProjects[1]);
  });

  it('onLeft nothing will do when a position is zero', () => {
    const projectService = fixture.debugElement.injector.get(ProjectService);
    projectService.setProjects(expectedProjects);
    component.currentPagenation = 0;
    component.reloadProject();
    component.onLeft();
    expect(component.projects[0]).toEqual(expectedProjects[0]);
    expect(component.projects[1]).toEqual(expectedProjects[1]);
  });

  it('reloadProject', () => {
    const projectService = fixture.debugElement.injector.get(ProjectService);
    projectService.setProjects(expectedProjects);
    component.currentPagenation = 1;
    component.reloadProject();
    expect(component.projects[0]).toEqual(expectedProjects[1]);
    expect(component.projects[1]).toEqual(expectedProjects[2]);
  });

});
