import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { RiskService } from '../services/risk.service';
import { NgForOf } from '@angular/common';
import {Risk} from "../models/Risk";
import {FormsModule} from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";

@Component({
  selector: 'app-risk',
  templateUrl: './risk.component.html',
  styleUrls: ['./risk.component.css'],
  standalone: true,
  imports: [BaseChartDirective, NgForOf, FormsModule, TranslateModule]
})
export class RiskComponent implements OnInit {
  risks: Risk[] = [];
  filteredRisks: Risk[] = [];
  filter: string = '';

  public barChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const risk = this.filteredRisks[context.dataIndex];
            const firmName = risk.product && risk.product.firm ? risk.product.firm.name : 'Unknown Firm';
            return `Risk Level: ${context.raw}, Firm: ${firmName}`;
          }
        }
      }
    }
  };
  public barChartLabels: string[] = [];
  public barChartData: ChartConfiguration['data'] = {
    labels: this.barChartLabels,
    datasets: [
      {
        data: [],
        label: 'High Risk',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      },
      {
        data: [],
        label: 'Moderate Risk',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1
      },
      {
        data: [],
        label: 'Low Risk',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };
  public barChartType: ChartType = 'bar';

  constructor(private riskService: RiskService) { }

  ngOnInit(): void {
    this.getRisks();
  }

  getRisks(): void {
    this.riskService.getRisks().subscribe({
      next: risks => {
        this.risks = risks;
        this.filteredRisks = risks;
        this.updateChart();
      },
      error: error => {
        console.error('Failed to fetch risks', error);
      }
    });
  }

  updateChart(): void {
    this.barChartLabels = this.filteredRisks.map(risk => risk.product ? risk.product.brandName : 'Unknown Product');

    const highRiskData = this.filteredRisks.map(risk => risk.riskLevel.toLowerCase() === 'high' ? 3 : 0);
    const moderateRiskData = this.filteredRisks.map(risk => risk.riskLevel.toLowerCase() === 'moderate' ? 2 : 0);
    const lowRiskData = this.filteredRisks.map(risk => risk.riskLevel.toLowerCase() === 'low' ? 1 : 0);

    this.barChartData.datasets[0].data = highRiskData;
    this.barChartData.datasets[1].data = moderateRiskData;
    this.barChartData.datasets[2].data = lowRiskData;
  }

  applyFilter(): void {
    if (this.filter) {
      this.filteredRisks = this.risks.filter(risk => risk.riskLevel.toLowerCase() === this.filter.toLowerCase());
    } else {
      this.filteredRisks = this.risks;
    }
    this.updateChart();
  }
}
