import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DataStorageService } from './data-storage.service';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { ProjectService } from '../projects/project.service';
import { defer } from 'rxjs';
import { Project } from '../projects/project.model';

import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { UserProjectService } from '../projects/user-project.service';

function asyncData<T>(data: T) {
  return defer(() => Promise.resolve(data));
}

describe('DataStorageService', () => {
  let httpClientSpy;
  let dataStorageService: DataStorageService;

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);
    dataStorageService = new DataStorageService(httpClientSpy as any, new ProjectService(), new UserProjectService());
  });

  it('fetch data', (done) => {
    const expectedProjects: Project[] = [
      { address: 'XXXXXXXX', description: 'test2 description', name: 'test2'  },
      { address: 'YYYYYYYY', description: 'test description', name: 'test'  },
    ];

    httpClientSpy.get.and.returnValue(asyncData(expectedProjects));
    dataStorageService.fetchProjects().subscribe(
      (response) => {
        expect(response).toEqual(expectedProjects, 'expected Projects');
        done();
      }
    );
  });

});
