import { Component, OnInit, ViewChild } from '@angular/core';
import { FirmService } from '../../services/firm.service';
import { Firm, NewFirm } from '../../models/firm';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf, NgClass } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfirmModalBootstrapComponent } from '../confirm-modal-bootstrap/confirm-modal-bootstrap.component';
import {TranslateModule} from "@ngx-translate/core";

declare var bootstrap: any;

type SortableFirmFields = 'name' | 'headquarters' | 'annualRevenue' | 'annualTax' | 'annualProfit';

@Component({
  selector: 'app-firm',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    HttpClientModule,
    MatSnackBarModule,
    NgIf,
    NgClass,
    ConfirmModalBootstrapComponent,
    TranslateModule
  ],
  templateUrl: './firm.component.html',
  styleUrls: ['./firm.component.css']
})
export class FirmComponent implements OnInit {
  firms: Firm[] = [];
  paginatedFirms: Firm[] = [];
  newFirm: NewFirm = { name: '', headquarters: '', annualRevenue: 0, annualTax: 0, annualProfit: 0 };
  searchQuery: string = '';
  showForm: boolean = false;
  showSearch: boolean = false;
  showList: boolean = false;
  selectedFirm: Firm | null = null;
  currentPage: number = 1;
  itemsPerPage: number = 4;
  totalPages: number = 1;
  firmToDelete: number | null = null;
  sortField: SortableFirmFields = 'name'; // Default sort field
  sortOrder: 'asc' | 'desc' = 'asc'; // or 'desc'

  @ViewChild(ConfirmModalBootstrapComponent) confirmModal!: ConfirmModalBootstrapComponent;

  constructor(private firmService: FirmService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    // Initially, show options to the user
  }

  getFirms(): void {
    this.firmService.getFirms()
      .subscribe({
        next: firms => {
          this.firms = firms;
          this.totalPages = Math.ceil(this.firms.length / this.itemsPerPage);
          this.applyFilter();
        },
        error: error => this.showError("Failed to fetch firms")
      });
  }

  searchFirms(): void {
    if (this.searchQuery.trim()) {
      this.firmService.searchFirms(this.searchQuery)
        .subscribe({
          next: firms => {
            this.firms = firms;
            this.totalPages = Math.ceil(this.firms.length / this.itemsPerPage);
            this.applyFilter();
            if (firms.length === 0) {
              this.showError("No firms found");
            }
          },
          error: error => this.showError("Failed to search firms")
        });
    } else {
      this.getFirms();
    }
  }

  applyFilter(): void {
    let filteredFirms = this.firms;
    this.sortFirms(filteredFirms);
  }

  sortFirms(firms: Firm[]): void {
    if (this.sortField) {
      firms.sort((a, b) => {
        let comparison = 0;
        if ((a[this.sortField] as any) > (b[this.sortField] as any)) {
          comparison = 1;
        } else if ((a[this.sortField] as any) < (b[this.sortField] as any)) {
          comparison = -1;
        }
        return this.sortOrder === 'asc' ? comparison : -comparison;
      });
    }
    this.paginatedFirms = firms.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
  }

  setSortField(field: SortableFirmFields): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc';
    }
    this.applyFilter();
  }

  getSortIcon(field: SortableFirmFields): string {
    if (this.sortField === field) {
      return this.sortOrder === 'asc' ? 'bi bi-chevron-up' : 'bi bi-chevron-down';
    }
    return 'bi bi-chevron-expand';
  }

  addFirm(): void {
    if (this.newFirm.name && this.newFirm.headquarters) {
      this.firmService.createFirm(this.newFirm)
        .subscribe({
          next: firm => {
            this.firms.push(firm);
            this.applyFilter();
            this.newFirm = { name: '', headquarters: '', annualRevenue: 0, annualTax: 0, annualProfit: 0 };
            this.showSuccess("Firm added successfully");
          },
          error: error => this.showError("Failed to add firm")
        });
    }
  }

  editFirm(firm: Firm): void {
    this.selectedFirm = { ...firm };
    this.showForm = true;
    this.showList = false;
    this.showSearch = false;
  }

  updateFirm(): void {
    if (this.selectedFirm && this.selectedFirm.name && this.selectedFirm.headquarters) {
      this.firmService.updateFirm(this.selectedFirm.id, this.selectedFirm)
        .subscribe({
          next: updatedFirm => {
            const index = this.firms.findIndex(f => f.id === updatedFirm.id);
            if (index !== -1) {
              this.firms[index] = updatedFirm;
              this.selectedFirm = null;
              this.applyFilter();
              this.showForm = false;
              this.showList = true;
              this.showSuccess("Firm updated successfully");
            }
          },
          error: error => this.showError("Failed to update firm")
        });
    }
  }

  confirmDeleteFirm(id: number): void {
    this.firmToDelete = id;
    this.openModal();
    this.confirmModal.confirmed.subscribe((confirmed: boolean) => {
      if (confirmed && this.firmToDelete !== null) {
        this.firmService.deleteFirm(this.firmToDelete)
          .subscribe({
            next: () => {
              this.firms = this.firms.filter(f => f.id !== this.firmToDelete);
              this.applyFilter();
              this.showSuccess("Firm deleted successfully");
            },
            error: error => this.showError("Failed to delete firm")
          });
      }
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
    this.getFirms();
  }

  paginateFirms(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedFirms = this.firms.slice(start, end);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginateFirms();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateFirms();
    }
  }

  openModal(): void {
    const modalElement = document.getElementById('confirmModal');
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

  formatCurrency(value: number): string {
    return value ? `€${value.toFixed(2)}` : '€0.00';
  }
}
