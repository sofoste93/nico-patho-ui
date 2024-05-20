import { Component, OnInit } from '@angular/core';
import { DiseaseService } from '../../services/disease.service';
import { Disease } from '../../models/disease';
import { FormsModule } from '@angular/forms';
import { NgForOf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatLine } from "@angular/material/core";

@Component({
  selector: 'app-disease',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    HttpClientModule,
    MatListModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatLine
  ],
  templateUrl: './disease.component.html',
  styleUrls: ['./disease.component.css']
})
export class DiseaseComponent implements OnInit {
  diseases: Disease[] = [];
  newDisease: Disease = { id: 0, name: '', description: '' };
  searchQuery: string = '';

  constructor(private diseaseService: DiseaseService) { }

  ngOnInit(): void {
    this.getDiseases();
  }

  getDiseases(): void {
    this.diseaseService.getDiseases()
      .subscribe(diseases => this.diseases = diseases);
  }

  addDisease(): void {
    if (this.newDisease.name && this.newDisease.description) {
      this.diseaseService.createDisease(this.newDisease)
        .subscribe(disease => {
          this.diseases.push(disease);
          this.newDisease = { id: 0, name: '', description: '' };
        });
    }
  }

  updateDisease(disease: Disease): void {
    if (disease.name && disease.description) {
      this.diseaseService.updateDisease(disease.id, disease)
        .subscribe(updatedDisease => {
          const index = this.diseases.findIndex(d => d.id === updatedDisease.id);
          if (index !== -1) {
            this.diseases[index] = updatedDisease;
          }
        });
    }
  }

  deleteDisease(id: number): void {
    this.diseaseService.deleteDisease(id)
      .subscribe(() => {
        this.diseases = this.diseases.filter(d => d.id !== id);
      });
  }

  searchDiseases(): void {
    if (this.searchQuery.trim()) {
      this.diseaseService.searchDiseases(this.searchQuery)
        .subscribe(diseases => this.diseases = diseases);
    } else {
      this.getDiseases();
    }
  }
}
