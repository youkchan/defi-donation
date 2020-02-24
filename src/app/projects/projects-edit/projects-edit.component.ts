import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DataStorageService } from '../../shared/data-storage.service';
import { ProjectService } from '../project.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-projects-edit',
  templateUrl: './projects-edit.component.html',
  styleUrls: ['./projects-edit.component.css']
})
export class ProjectsEditComponent implements OnInit {
  @ViewChild('projectForm', { static: false }) projectForm: NgForm;

  constructor(
    private dataStorageService: DataStorageService,
    private projectService: ProjectService,
    private router: Router
    ) { }

  ngOnInit() {
  }

  onSubmit() {
   if (!this.isValid()) {
     return;
   }
   this.dataStorageService.saveProject(this.projectForm.value).subscribe(
      (response) => {
        this.projectService.addProject(this.projectForm.value);
        this.router.navigate(['/projects']);
      }
    );
  }

  private isValid() {
    return this.projectForm.valid;
  }

}
