import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DataStorageService } from './data-storage.service';
import { HttpEvent, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { ProjectService } from '../projects/project.service';
import { defer, Observable, throwError, of } from 'rxjs';
import { Project } from '../projects/project.model';

import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { UserProjectService } from '../projects/user-project.service';
import { UserProject } from '../projects/user-project.model';

function asyncData<T>(data: T) {
  return defer(() => Promise.resolve(data));
}

describe('DataStorageService', () => {
  let httpClientSpy;
  let dataStorageService: DataStorageService;
  let dataStorageServiceSpy: any;

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch']);
    dataStorageService = new DataStorageService(httpClientSpy as any, new ProjectService(), new UserProjectService());
    dataStorageServiceSpy = dataStorageService;
  });

  it('fetchProjects', (done) => {
    const expectedProjects: Project[] = [
      { address: 'XXXXXXXX', description: 'test2 description', name: 'test2'  },
      { address: 'YYYYYYYY', description: 'test description', name: 'test'  },
    ];

    httpClientSpy.get.and.returnValue(asyncData(expectedProjects));
    dataStorageServiceSpy.fetchProjects().subscribe(
      (response) => {
        expect(expectedProjects).toEqual(response, 'expected Projects');
        expect(expectedProjects).toEqual(dataStorageServiceSpy.projectService.getProjects());
        done();
      }
    );
  });

  it('fetchProjects error', (done) => {
    httpClientSpy.get.and.returnValue(throwError({
      error: new ErrorEvent('clientError', {
        message : 'Some error occured!',
      })
    }));

    dataStorageServiceSpy.fetchProjects().subscribe(
      result => {
        /* Nothing Happens */
      },
      error => {
        expect('Something bad happened; please try again later.').toEqual(error);
        done();
      }
    );
  });


  it('fetchUserProjects', (done) => {
    const userAddress = 'XXXXXXXX';
    const inputUserProjects: {[key: string]: UserProject} = {
      key1: { userAddress: 'XXXXXXXX', amount: 10 , projectAddress: 'YYYYYYYYY', id: 'id1', delFlg: 0  },
      key2: { userAddress: 'XXXXXXXX', amount: 5 , projectAddress: 'ZZZZZZZZZ', id: 'id2', delFlg: 0  },
      key3: { userAddress: 'YYYYYYYY', amount: 6 , projectAddress: 'YYYYYYYYY', id: 'id3', delFlg: 0  },
      key4: { userAddress: 'XXXXXXXX', amount: 6 , projectAddress: 'AAAAAAAA', id: 'id4', delFlg: 1  },
    };

    const expectedUserProjects: UserProject[] = [
      { userAddress: 'XXXXXXXX', amount: 10 , projectAddress: 'YYYYYYYYY', id: 'key1', delFlg: 0  },
      { userAddress: 'XXXXXXXX', amount: 5 , projectAddress: 'ZZZZZZZZZ', id: 'key2', delFlg: 0  },
    ];

    httpClientSpy.get.and.returnValue(asyncData(inputUserProjects));
    dataStorageServiceSpy.fetchUserProjects(userAddress).subscribe(
      (response) => {
        expect(expectedUserProjects).toEqual(response, 'expected Projects');
        expect(expectedUserProjects).toEqual(dataStorageServiceSpy.userProjectService.getUserProjects());
        done();
      }
    );
  });

  it('fetchUserProjects error', (done) => {
    const userAddress = 'XXXXXXXX';
    httpClientSpy.get.and.returnValue(throwError({
      error: new ErrorEvent('clientError', {
        message : 'Some error occured!',
      })
    }));

    dataStorageServiceSpy.fetchUserProjects(userAddress).subscribe(
      result => {
        /* Nothing Happens */
      },
      error => {
        expect('Something bad happened; please try again later.').toEqual(error);
        done();
      }
    );
  });



  it('saveUserProject error', (done) => {
    const userProjects: UserProject[] = [
      { userAddress: 'XXXXXXXX', amount: 10 , projectAddress: 'YYYYYYYYY', id: 'key1', delFlg: 0  },
      { userAddress: 'XXXXXXXX', amount: 5 , projectAddress: 'ZZZZZZZZZ', id: 'key2', delFlg: 0  },
    ];

    httpClientSpy.post.and.returnValue(throwError({
      error: new ErrorEvent('clientError', {
        message : 'Some error occured!',
      })
    }));

    dataStorageServiceSpy.saveUserProject(userProjects).subscribe(
      result => {
        /* Nothing Happens */
      },
      error => {
        expect('Something bad happened; please try again later.').toEqual(error);
        done();
      }
    );
  });

  it('deleteSpecificUserProject error', (done) => {

    const userProject: UserProject = { userAddress: 'XXXXXXXX', amount: 5 , projectAddress: 'ZZZZZZZZZ', id: 'key2', delFlg: 0  };
    httpClientSpy.patch.and.returnValue(throwError({status: 404}));
    dataStorageServiceSpy.deleteSpecificUserProject({key: userProject}).subscribe(
      result => {
        /* Nothing Happens */
      },
      error => {
        expect('Something bad happened; please try again later.').toEqual(error);
        done();
      }
    );
  });

  it('saveProject error', (done) => {
    const project: Project = { address: 'XXXXXXXX', description: 'test2 description', name: 'test2'  };

    httpClientSpy.post.and.returnValue(throwError({
      error: new ErrorEvent('clientError', {
        message : 'Some error occured!',
      })
    }));


    dataStorageServiceSpy.saveProject(project).subscribe(
      result => {
        /* Nothing Happens */
      },
      error => {
        expect('Something bad happened; please try again later.').toEqual(error);
        done();
      }
    );
  });

  it('handleError clientError', (done) => {
    const throwObj = {
      error: new ErrorEvent('clientError', {
        message : 'Some error occured!',
      })
    };

    spyOn(window.console, 'error');

    (dataStorageServiceSpy as any).handleError(throwObj).subscribe(
      result => {
      /* Nothing Happens */
      },
      error => {
        expect(window.console.error).toHaveBeenCalledWith('An error occurred:', 'Some error occured!');
        done();
      }
    );
  });

  it('handleError ServerError', (done) => {
    const status = 404;
    const throwObj = {status};

    spyOn(window.console, 'error');
    (dataStorageServiceSpy as any).handleError(throwObj).subscribe(
      result => {
      /* Nothing Happens */
      },
      error => {
        expect(window.console.error).toHaveBeenCalledWith(
            `Backend returned code ${status}, ` +
            `body was: undefined`
          );
        done();
      }
    );
  });
});
