import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Web3Service } from './shared/web3.service';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { ProjectsComponent } from './projects/projects.component';
import { ProjectsEditComponent } from './projects/projects-edit/projects-edit.component';
import { HowToUseComponent } from './how-to-use/how-to-use.component';
import { LoadingSpinnerComponent } from './shared/loading-spinner/loading-spinner.component';
import { ProcessingSpinnerComponent } from './shared/processing-spinner/processing-spinner.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        ProjectsComponent,
        ProjectsEditComponent,
        HowToUseComponent,
        LoadingSpinnerComponent,
        ProcessingSpinnerComponent
      ],
      imports: [HttpClientModule, BrowserModule, FormsModule, AppRoutingModule],
      providers: [Web3Service]
    }).compileComponents();
  }));

  it('should create the app', async (() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;

    const web3Service = fixture.debugElement.injector.get(Web3Service);
    web3Service.network = 'Rinkeby Network';
    fixture.detectChanges();
    fixture.whenStable().then( () => {
      expect('Rinkeby Network').toEqual(app.network);
      expect(app).toBeTruthy();
    });
  }));
/*
  it(`should have as title 'defi-donation'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('DeFi-Donation');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.content span').textContent).toContain('defi-donation app is running!');
  });*/
});
