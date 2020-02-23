import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Project } from '../projects/project.model';
import { map, tap  } from 'rxjs/operators';
import { ProjectService } from '../projects/project.service';

@Injectable({providedIn: 'root'})
export class DataStorageService {

  constructor(
    private http: HttpClient,
    private projectService: ProjectService
    ) {}

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
