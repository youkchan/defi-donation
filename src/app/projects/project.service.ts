import { Injectable } from '@angular/core';
import { Project } from './project.model';
import { DataStorageService } from '../shared/data-storage.service';
import { Subject } from 'rxjs';

@Injectable({providedIn: 'root'})
export class ProjectService {
  private projects: Project[] = [];
  projectChanged = new Subject<Project[]>();

  constructor() {}

  setProjects(projects: Project[]) {
    this.projects = projects;
    this.projectChanged.next(this.projects.slice());
  }

  getProjects() {
    return this.projects.slice();
  }

  addProject(project: Project) {
    this.projects.push(project);
    this.projectChanged.next(this.projects.slice());
  }

}
