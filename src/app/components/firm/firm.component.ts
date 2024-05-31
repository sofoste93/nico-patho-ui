import { Component, OnInit } from '@angular/core';
import { FirmService } from '../../services/firm.service';
import { Firm, NewFirm } from '../../models/firm';
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
    MatButtonModule,
    MatLine,
    MatSnackBarModule,
    NgIf
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
          this.paginateFirms();
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
            this.paginateFirms();
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

  addFirm(): void {
    if (this.newFirm.name && this.newFirm.headquarters) {
      this.firmService.createFirm(this.newFirm)
        .subscribe({
          next: firm => {
            this.firms.push(firm);
            this.totalPages = Math.ceil(this.firms.length / this.itemsPerPage);
            this.paginateFirms();
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
              this.showForm = false;
              this.showList = true;
              this.showSuccess("Firm updated successfully");
            }
          },
          error: error => this.showError("Failed to update firm")
        });
    }
  }

  deleteFirm(id: number): void {
    this.firmService.deleteFirm(id)
      .subscribe({
        next: () => {
          this.firms = this.firms.filter(f => f.id !== id);
          this.totalPages = Math.ceil(this.firms.length / this.itemsPerPage);
          this.paginateFirms();
          this.showSuccess("Firm deleted successfully");
        },
        error: error => this.showError("Failed to delete firm")
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
