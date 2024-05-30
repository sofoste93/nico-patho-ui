import { Component, OnInit } from '@angular/core';
import { DiseaseService } from '../../services/disease.service';
import { Disease } from '../../models/disease';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatLine } from "@angular/material/core";
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

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
    MatLine,
    MatSnackBarModule,
    NgIf
  ],
  templateUrl: './disease.component.html',
  styleUrls: ['./disease.component.css']
})
export class DiseaseComponent implements OnInit {
  diseases: Disease[] = [];
  newDisease: Disease = { id: 0, name: '', description: '' };
  searchQuery: string = '';
  showForm: boolean = false;
  showSearch: boolean = false;
  showList: boolean = false;
  selectedDisease: Disease | null = null;

  constructor(private diseaseService: DiseaseService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    // Initially, show options to the user
  }

  getDiseases(): void {
    this.diseaseService.getDiseases()
      .subscribe({
        next: diseases => this.diseases = diseases,
        error: error => this.showError("Failed to fetch diseases")
      });
  }

  searchDiseases(): void {
    if (this.searchQuery.trim()) {
      this.diseaseService.searchDiseases(this.searchQuery)
        .subscribe({
          next: diseases => {
            this.diseases = diseases;
            if (diseases.length === 0) {
              this.showError("No diseases found");
            }
          },
          error: error => this.showError("Failed to search diseases")
        });
    } else {
      this.getDiseases();
    }
  }

  addDisease(): void {
    if (this.newDisease.name && this.newDisease.description) {
      const newDiseaseToAdd = { ...this.newDisease };
      // @ts-ignore
      delete newDiseaseToAdd.id; // Ensure ID is undefined
      this.diseaseService.createDisease(newDiseaseToAdd)
        .subscribe({
          next: disease => {
            this.diseases.push(disease);
            this.newDisease = { id: 0, name: '', description: '' };
            this.showSuccess("Disease added successfully");
          },
          error: error => this.showError("Failed to add disease")
        });
    }
  }




  editDisease(disease: Disease): void {
    this.selectedDisease = { ...disease };
    this.showForm = true;
    this.showList = false;
    this.showSearch = false;
  }

  updateDisease(): void {
    if (this.selectedDisease && this.selectedDisease.name && this.selectedDisease.description) {
      this.diseaseService.updateDisease(this.selectedDisease.id, this.selectedDisease)
        .subscribe({
          next: updatedDisease => {
            const index = this.diseases.findIndex(d => d.id === updatedDisease.id);
            if (index !== -1) {
              this.diseases[index] = updatedDisease;
              this.selectedDisease = null;
              this.showForm = false;
              this.showList = true;
              this.showSuccess("Disease updated successfully");
            }
          },
          error: error => this.showError("Failed to update disease")
        });
    }
  }

  deleteDisease(id: number): void {
    this.diseaseService.deleteDisease(id)
      .subscribe({
        next: () => {
          this.diseases = this.diseases.filter(d => d.id !== id);
          this.showSuccess("Disease deleted successfully");
        },
        error: error => this.showError("Failed to delete disease")
      });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    this.showSearch = false;
    this.showList = false;
  }

  toggleSearch(): void {
    this.showSearch = !this.showSearch;
    this.showForm = false;
    this.showList = false;
  }

  toggleList(): void {
    this.showList = !this.showList;
    this.showForm = false;
    this.showSearch = false;
    this.getDiseases();
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['snackbar-error']
    });
  }

  showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['snackbar-success']
    });
  }
}
