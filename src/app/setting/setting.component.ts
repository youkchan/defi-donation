import { Component, OnInit } from '@angular/core';
import { DeFiDonationContractService } from '../shared/defidonation-contract.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class SettingComponent implements OnInit {
  donationAccount: string;
  constructor(
    private defiDonationContractService: DeFiDonationContractService,
  ) { }

  ngOnInit() {
    this.getDonationAccount();
  }

  getDonationAccount() {
    this.defiDonationContractService.beReady().then(() => {
      this.defiDonationContractService.getDonationAccount().then((data) => {
        this.donationAccount = data;
      });
    });
  }


}
