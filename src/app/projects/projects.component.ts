import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProjectService } from './project.service';
import { Project } from './project.model';
import { Subscription } from 'rxjs';
import { DataStorageService } from '../shared/data-storage.service';
import { Web3Service } from '../shared/web3.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
})
export class ProjectsComponent implements OnInit, OnDestroy {
  projects: Project[] = [];
  projectsAll: Project[] = [];
  currentPagenation = 0;
  isLimit = false;
  subscription: Subscription;

  constructor(
    private projectService: ProjectService,
    private dataStorageService: DataStorageService,
    // private web3Service:Web3Service
    ) { }

  ngOnInit() {
    this.subscription = this.projectService.projectChanged
      .subscribe(
        (projects: Project[]) => {
          this.projectsAll = projects;
          this.reloadProject();
        }
      );

    this.dataStorageService.fetchProjects().subscribe();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onRight() {
    if (this.isLimit) {
      return;
    }
    this.currentPagenation++;
    this.reloadProject();
    this.checkLimit();
  }

  onLeft() {
    if (this.currentPagenation <= 0) {
      return;
    }
    this.currentPagenation--;
    this.reloadProject();
    this.checkLimit();
  }

  reloadProject() {
    this.projects = [];
    this.projects.push(this.projectsAll[this.currentPagenation]);
    this.projects.push(this.projectsAll[this.currentPagenation + 1]);
  }

  private checkLimit() {
    if (this.currentPagenation + 2 === this.projectsAll.length) {
      this.isLimit = true;
    } else {
      this.isLimit = false;
    }
  }



}
