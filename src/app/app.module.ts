import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ProjectsComponent } from './projects/projects.component';
import { AppRoutingModule } from './app-routing.module';
import { ProjectsEditComponent } from './projects/projects-edit/projects-edit.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoadingSpinnerComponent } from './shared/loading-spinner/loading-spinner.component';
import { ProcessingSpinnerComponent } from './shared/processing-spinner/processing-spinner.component';
import { HowToUseComponent } from './how-to-use/how-to-use.component';


@NgModule({
  declarations: [
    AppComponent,
    ProjectsComponent,
    ProjectsEditComponent,
    LoadingSpinnerComponent,
    ProcessingSpinnerComponent,
    HowToUseComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
