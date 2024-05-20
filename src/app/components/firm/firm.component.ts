import { Component, OnInit } from '@angular/core';
import { FirmService } from '../../services/firm.service';
import { Firm } from '../../models/firm';
import { FormsModule } from '@angular/forms';
import { NgForOf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-firm',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    HttpClientModule,
    MatListModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './firm.component.html',
  styleUrls: ['./firm.component.css']
})
export class FirmComponent implements OnInit {
  firms: Firm[] = [];
  newFirm: Firm = { id: 0, name: '', headquarters: '', annualRevenue: 0, annualTax: 0, annualProfit: 0 };

  constructor(private firmService: FirmService) { }

  ngOnInit(): void {
    this.getFirms();
  }

  getFirms(): void {
    this.firmService.getFirms()
      .subscribe(firms => this.firms = firms);
  }

  addFirm(): void {
    this.firmService.createFirm(this.newFirm)
      .subscribe(firm => {
        this.firms.push(firm);
        this.newFirm = { id: 0, name: '', headquarters: '', annualRevenue: 0, annualTax: 0, annualProfit: 0 };
      });
  }

  deleteFirm(id: number): void {
    this.firmService.deleteFirm(id)
      .subscribe(() => {
        this.firms = this.firms.filter(f => f.id !== id);
      });
  }
}
