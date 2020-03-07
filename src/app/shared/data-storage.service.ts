import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Project } from '../projects/project.model';
import { map, tap, catchError  } from 'rxjs/operators';
import { ProjectService } from '../projects/project.service';
import { UserProjectService } from '../projects/user-project.service';
import { UserProject } from '../projects/user-project.model';
import { throwError } from 'rxjs';

@Injectable({providedIn: 'root'})
export class DataStorageService {

  constructor(
    private http: HttpClient,
    private projectService: ProjectService,
    private userProjectService: UserProjectService
    ) {}

  saveUserProject(userProject: UserProject) {
    return this.http.post<{name: string}>('https://defi-donation.firebaseio.com/userProjects.json',
      userProject
    ).pipe(
      catchError(this.handleError)
    );
  }

  fetchUserProjects(userAddress: string) {
    return this.http.get<UserProject[]>('https://defi-donation.firebaseio.com/userProjects.json')
            .pipe(
              map((response) => {
                const projectArray: UserProject[] = [];
                for (const key in response) {
                  if (response.hasOwnProperty(key) && response[key].delFlg !== 1 && response[key].userAddress === userAddress) {
                     const userProjectObj = {...response[key]};
                     userProjectObj.id = key;
                     projectArray.push(userProjectObj);
                  }
                }
                return projectArray;
              }),
              tap(userProjects => {
                this.userProjectService.setUserProjects(userProjects);
              }),
              catchError(this.handleError)
            );
  }

  deleteSpecificUserProject(deleteUserProject: {[key: string]: UserProject} ) {
    return this.http.patch('https://defi-donation.firebaseio.com/userProjects.json',
      deleteUserProject
    ).pipe(
      catchError(this.handleError)
    );
  }

  saveProject(project: Project) {
    return this.http.post('https://defi-donation.firebaseio.com/projects.json',
      project
    ).pipe(
      catchError(this.handleError)
    );
  }

  fetchProjects() {
    return this.http.get<Project[]>('https://defi-donation.firebaseio.com/projects.json')
            .pipe(
            map((response) => {
              const projectArray: Project[] = [];
              for (const key in response) {
                if (response.hasOwnProperty(key)) {
                  projectArray.push({...response[key]});
                }
              }
              return projectArray;
            }),
            tap(projects => {
              this.projectService.setProjects(projects);
            }),
            catchError(this.handleError),
            );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    return throwError(
      'Something bad happened; please try again later.'
      );
  }
}
