import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingSpinnerComponent } from './processing-spinner.component';

describe('ProcessingSpinnerComponent', () => {
  let component: ProcessingSpinnerComponent;
  let fixture: ComponentFixture<ProcessingSpinnerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessingSpinnerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
