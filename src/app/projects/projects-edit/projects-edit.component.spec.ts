import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsEditComponent } from './projects-edit.component';
import { ProjectService } from '../project.service';
import { Router } from '@angular/router';
import { DataStorageService } from '../../shared/data-storage.service';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { ProjectsComponent } from '../projects.component';
import { SettingComponent } from 'src/app/setting/setting.component';
import { of } from 'rxjs';
import { LoadingSpinnerComponent } from 'src/app/shared/loading-spinner/loading-spinner.component';



describe('ProjectsEditComponent', () => {
  let component: ProjectsEditComponent;
  let fixture: ComponentFixture<ProjectsEditComponent>;
  const routerSpy = {navigate: jasmine.createSpy('navigate')};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectsEditComponent, ProjectsComponent, SettingComponent, LoadingSpinnerComponent],
      imports: [BrowserModule, AppRoutingModule, FormsModule, HttpClientModule],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onSubmit', async (done) => {
    const dataStorageService = fixture.debugElement.injector.get(DataStorageService);
    const projectService = fixture.debugElement.injector.get(ProjectService);
    fixture.whenStable().then( () => {
      spyOn(dataStorageService, 'saveProject').and.returnValue(of('OK'));
      spyOn<any>(component, 'isValid').and.returnValue(true);

      const inputObj = [{ name: 'Test Project', description: 'Test Project Description', address: 'BBBBBBBB'}];
      component.projectForm.value.name = inputObj[0].name;
      component.projectForm.value.description = inputObj[0].description;
      component.projectForm.value.address = inputObj[0].address;
      fixture.detectChanges();
      component.onSubmit();
      expect(inputObj).toEqual(projectService.getProjects());
      expect (routerSpy.navigate).toHaveBeenCalledWith(['/projects']);
      done();
    });

  });

  it('onSubmit if form is invalid', async (done) => {
    const projectService = fixture.debugElement.injector.get(ProjectService);
    fixture.whenStable().then( () => {
      spyOn<any>(component, 'isValid').and.returnValue(false);
      const inputObj = [{ name: 'Test Project', description: 'Test Project Description', address: 'BBBBBBBB'}];
      component.projectForm.value.name = inputObj[0].name;
      component.projectForm.value.description = inputObj[0].description;
      component.projectForm.value.address = inputObj[0].address;
      fixture.detectChanges();
      component.onSubmit();
      expect(inputObj).not.toEqual(projectService.getProjects());
      done();
    });
  });

  it('isValid', () => {
      spyOnProperty(component.projectForm, 'valid').and.returnValue(false);
      const result = (component as any ).isValid();
      expect(false).toEqual(result);
  });

});
