import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { ProjectsComponent } from './projects/projects.component';
import { ProjectsEditComponent } from './projects/projects-edit/projects-edit.component';
import { HowToUseComponent } from './how-to-use/how-to-use.component';


const appRoute = [
  { path: '', redirectTo: '/projects' , pathMatch: 'full' },
  { path: 'projects',
    children: [
      { path: '', component: ProjectsComponent },
      { path: 'new', component: ProjectsEditComponent },
    ]
  },
  { path: 'howtouse', component: HowToUseComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoute)],
  exports: [RouterModule]

})
export class AppRoutingModule {
}
