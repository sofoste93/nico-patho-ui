import { Component, OnInit, ViewChild } from '@angular/core';
import { DiseaseService } from '../../services/disease.service';
import {Disease, NewDisease, ProductDisease} from '../../models/disease';
import { ProductDiseaseService } from '../../services/product-disease.service'; // Importer le service
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmModalBootstrapComponent } from '../confirm-modal-bootstrap/confirm-modal-bootstrap.component';

declare var bootstrap: any;

@Component({
  selector: 'app-disease',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    HttpClientModule,
    MatSnackBarModule,
    NgIf,
    ConfirmModalBootstrapComponent
  ],
  templateUrl: './disease.component.html',
  styleUrls: ['./disease.component.css']
})
export class DiseaseComponent implements OnInit {
  diseases: Disease[] = [];
  paginatedDiseases: Disease[] = [];
  newDisease: NewDisease = { name: '', description: '' };
  searchQuery: string = '';
  showForm: boolean = false;
  showSearch: boolean = false;
  showList: boolean = false;
  selectedDisease: Disease | null = null;
  currentPage: number = 1;
  itemsPerPage: number = 4;
  totalPages: number = 1;
  associatedRisks: ProductDisease[] = []; // Ajouter cette ligne

  @ViewChild(ConfirmModalBootstrapComponent) confirmModal!: ConfirmModalBootstrapComponent;

  constructor(
    private diseaseService: DiseaseService,
    private productDiseaseService: ProductDiseaseService, // Injecter le service
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Initialisation
  }

  getDiseases(): void {
    this.diseaseService.getDiseases()
      .subscribe({
        next: diseases => {
          this.diseases = diseases;
          this.totalPages = Math.ceil(this.diseases.length / this.itemsPerPage);
          this.paginateDiseases();
        },
        error: error => this.showError("Failed to fetch diseases")
      });
  }

  searchDiseases(): void {
    if (this.searchQuery.trim()) {
      this.diseaseService.searchDiseases(this.searchQuery)
        .subscribe({
          next: diseases => {
            this.diseases = diseases;
            this.totalPages = Math.ceil(this.diseases.length / this.itemsPerPage);
            this.paginateDiseases();
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
    this.openModal();
    this.confirmModal.confirmed.subscribe((confirmed: boolean) => {
      if (confirmed) {
        if (this.newDisease.name && this.newDisease.description) {
          this.diseaseService.createDisease(this.newDisease)
            .subscribe({
              next: disease => {
                this.diseases.push(disease);
                this.totalPages = Math.ceil(this.diseases.length / this.itemsPerPage);
                this.paginateDiseases();
                this.newDisease = { name: '', description: '' };
                this.showSuccess("Disease added successfully");
              },
              error: error => this.showError("Failed to add disease")
            });
        }
      }
    });
  }

  editDisease(disease: Disease): void {
    this.selectedDisease = { ...disease };
    this.showForm = true;
    this.showList = false;
    this.showSearch = false;
  }

  updateDisease(): void {
    this.openModal();
    this.confirmModal.confirmed.subscribe((confirmed: boolean) => {
      if (confirmed) {
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
    });
  }

  deleteDisease(id: number): void {
    this.openModal();
    this.confirmModal.confirmed.subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.diseaseService.deleteDisease(id)
          .subscribe({
            next: () => {
              this.diseases = this.diseases.filter(d => d.id !== id);
              this.totalPages = Math.ceil(this.diseases.length / this.itemsPerPage);
              this.paginateDiseases();
              this.showSuccess("Disease deleted successfully");
            },
            error: error => this.showError("Failed to delete disease")
          });
      }
    });
  }

  viewAssociatedRisks(diseaseId: number): void {
    this.productDiseaseService.getProductDiseasesByDiseaseId(diseaseId)
      .subscribe({
        next: productDiseases => {
          this.associatedRisks = productDiseases;
          this.openRisksModal();
        },
        error: error => this.showError("Failed to fetch associated risks")
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

  paginateDiseases(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedDiseases = this.diseases.slice(start, end);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginateDiseases();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateDiseases();
    }
  }

  openModal(): void {
    const modalElement = document.getElementById('confirmModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  openRisksModal(): void {
    const modalElement = document.getElementById('viewRisksModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
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
