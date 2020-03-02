import { Component, OnInit } from '@angular/core';
import { loadavg } from 'os';
import { Web3Service } from './shared/web3.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Defi-Donation';
  network: string;

  constructor(
    private web3Service: Web3Service,
  ) {}

  ngOnInit() {
    this.web3Service.beReady().then(() => {
      this.network = this.web3Service.network;
    });
  }

}
