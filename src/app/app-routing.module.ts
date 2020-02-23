import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { ProjectsComponent } from './projects/projects.component';
import { SettingComponent } from './setting/setting.component';
import { ProjectsEditComponent } from './projects/projects-edit/projects-edit.component';


const appRoute = [
  { path: '', redirectTo: '/projects' , pathMatch: 'full' },
  { path: 'projects',
    children: [
      { path: '', component: ProjectsComponent },
      { path: 'new', component: ProjectsEditComponent },
    ]
  },
  { path: 'setting', component: SettingComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoute)],
  exports: [RouterModule]

})
export class AppRoutingModule {
}
