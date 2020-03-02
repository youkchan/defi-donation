import { Injectable } from '@angular/core';
import { Project } from './project.model';
import { DataStorageService } from '../shared/data-storage.service';
import { Subject } from 'rxjs';
import { UserProject } from './user-project.model';

@Injectable({providedIn: 'root'})
export class UserProjectService {
  private userProjects: UserProject[] = [];
  userProjectChanged = new Subject<UserProject[]>();

  constructor() {}

  setUserProjects(userProject: UserProject[]) {
    this.userProjects = userProject;
    this.userProjectChanged.next(this.userProjects.slice());
  }

  getUserProjects() {
    return this.userProjects.slice();
  }

  addUserProject(userProject: UserProject) {
    this.userProjects.push(userProject);
    this.userProjectChanged.next(this.userProjects.slice());
  }

  deleteUserProject(_id: string) {
    console.log(_id);
    this.userProjects.forEach((userProject, index) => {
      if (userProject.id === _id) {
        this.userProjects.splice(index, 1);
      }
    });
    this.userProjectChanged.next(this.userProjects.slice());
  }
}
