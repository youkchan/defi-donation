import { Component, OnInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-processing-spinner',
  templateUrl: './processing-spinner.component.html',
  styleUrls: ['./processing-spinner.component.css']
})
export class ProcessingSpinnerComponent implements OnInit {

  spinnerLeft: string;

  constructor(private el: ElementRef) { }

  ngOnInit() {
    this.spinnerLeft = (window.innerWidth / 2) - (25 / 2) + 'px';
  }

}
