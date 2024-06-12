import { Component, OnInit, ViewChild } from '@angular/core';
import { DiseaseService } from '../../services/disease.service';
import { Disease, NewDisease, ProductDisease } from '../../models/disease';
import { ProductDiseaseService } from '../../services/product-disease.service'; // Importer le service
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmModalBootstrapComponent } from '../confirm-modal-bootstrap/confirm-modal-bootstrap.component';
import { TranslateModule } from "@ngx-translate/core";

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
    ConfirmModalBootstrapComponent,
    TranslateModule
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
  selectedDisease: Disease = { id: 0, name: '', description: '' };
  currentPage: number = 1;
  itemsPerPage: number = 4;
  totalPages: number = 1;
  associatedRisks: ProductDisease[] = [];
  formMode: 'add' | 'edit' = 'add';

  @ViewChild(ConfirmModalBootstrapComponent) confirmModal!: ConfirmModalBootstrapComponent;

  constructor(
    private diseaseService: DiseaseService,
    private productDiseaseService: ProductDiseaseService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.getDiseases();
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
        if (this.selectedDisease.name && this.selectedDisease.description) {
          this.diseaseService.createDisease(this.selectedDisease)
            .subscribe({
              next: disease => {
                this.diseases.push(disease);
                this.totalPages = Math.ceil(this.diseases.length / this.itemsPerPage);
                this.paginateDiseases();
                this.selectedDisease = { id: 0, name: '', description: '' };
                this.showSuccess("Disease added successfully");
              },
              error: error => this.showError("Failed to add disease")
            });
        }
      }
    });
  }

  toggleForm(mode: 'add' | 'edit', disease?: Disease): void {
    this.formMode = mode;
    if (mode === 'edit' && disease) {
      this.selectedDisease = { ...disease };
    } else {
      this.selectedDisease = { id: 0, name: '', description: '' };
    }
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
                  this.selectedDisease = { id: 0, name: '', description: '' };
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

  toggleList(): void {
    this.showList = !this.showList;
    this.showForm = false;
    this.showSearch = false;
    this.getDiseases();
  }

  toggleSearch(): void {
    this.showSearch = !this.showSearch;
    this.showForm = false;
    this.showList = false;
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
