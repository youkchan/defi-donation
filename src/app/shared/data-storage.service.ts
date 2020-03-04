import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Project } from '../projects/project.model';
import { map, tap  } from 'rxjs/operators';
import { ProjectService } from '../projects/project.service';
import { UserProjectService } from '../projects/user-project.service';
import { UserProject } from '../projects/user-project.model';

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
              })
            );
  }

  deleteSpecificUserProject(deleteUserProject: {[key: string]: UserProject} ) {
    return this.http.patch('https://defi-donation.firebaseio.com/userProjects.json',
      deleteUserProject
    );
  }

  saveProject(project: Project) {
    return this.http.post('https://defi-donation.firebaseio.com/projects.json',
      project
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
            })
            );
  }
}
