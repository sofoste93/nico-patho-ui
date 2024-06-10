import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {FormsModule} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";
import {NewProductDisease, ProductDisease} from "../models/product-disease.model";
import {Product} from "../models/product";
import {Disease} from "../models/disease";
import {ConfirmModalBootstrapComponent} from "../components/confirm-modal-bootstrap/confirm-modal-bootstrap.component";
import {ProductDiseaseService} from "../services/product-disease.service";
import {ProductService} from "../services/product.service";
import {DiseaseService} from "../services/disease.service";

declare var bootstrap: any;

@Component({
  selector: 'app-product-disease',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf
  ],
  templateUrl: './product-disease.component.html',
  styleUrl: './product-disease.component.css'
})

export class ProductDiseaseComponent implements OnInit {
  productDiseases: ProductDisease[] = [];
  paginatedProductDiseases: ProductDisease[] = [];
  newProductDisease: NewProductDisease = { productId: null, diseaseId: null, riskLevel: '' };
  products: Product[] = [];
  diseases: Disease[] = [];
  searchQuery: string = '';
  showForm: boolean = false;
  showSearch: boolean = false;
  showList: boolean = false;
  selectedProductDisease: ProductDisease | null = null;
  currentPage: number = 1;
  itemsPerPage: number = 4;
  totalPages: number = 1;
  productDiseaseToDelete: number | null = null;

  @ViewChild(ConfirmModalBootstrapComponent) confirmModal!: ConfirmModalBootstrapComponent;

  constructor(
    private productDiseaseService: ProductDiseaseService,
    private productService: ProductService,
    private diseaseService: DiseaseService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.getProducts();
    this.getDiseases();
  }

  getProducts(): void {
    this.productService.getProducts()
      .subscribe(products => this.products = products);
  }

  getDiseases(): void {
    this.diseaseService.getDiseases()
      .subscribe(diseases => this.diseases = diseases);
  }

  getProductDiseases(): void {
    this.productDiseaseService.getProductDiseases()
      .subscribe(productDiseases => {
        this.productDiseases = productDiseases;
        this.totalPages = Math.ceil(this.productDiseases.length / this.itemsPerPage);
        this.paginateProductDiseases();
      });
  }

  addProductDisease(): void {
    if (this.newProductDisease.productId && this.newProductDisease.diseaseId) {
      this.productDiseaseService.createProductDisease(this.newProductDisease)
        .subscribe(productDisease => {
          this.productDiseases.push(productDisease);
          this.totalPages = Math.ceil(this.productDiseases.length / this.itemsPerPage);
          this.paginateProductDiseases();
          this.newProductDisease = { productId: null, diseaseId: null, riskLevel: '' };
          this.showSuccess("Product-Disease relationship added successfully");
        }, error => this.showError("Failed to add Product-Disease relationship"));
    }
  }

  editProductDisease(productDisease: ProductDisease): void {
    this.selectedProductDisease = { ...productDisease };
    this.showForm = true;
    this.showList = false;
    this.showSearch = false;
  }

  updateProductDisease(): void {
    if (this.selectedProductDisease) {
      this.productDiseaseService.updateProductDisease(this.selectedProductDisease.id, this.selectedProductDisease)
        .subscribe(updatedProductDisease => {
          const index = this.productDiseases.findIndex(pd => pd.id === updatedProductDisease.id);
          if (index !== -1) {
            this.productDiseases[index] = updatedProductDisease;
            this.selectedProductDisease = null;
            this.showForm = false;
            this.showList = true;
            this.showSuccess("Product-Disease relationship updated successfully");
          }
        }, error => this.showError("Failed to update Product-Disease relationship"));
    }
  }

  confirmDeleteProductDisease(id: number): void {
    this.productDiseaseToDelete = id;
    this.openModal();
    this.confirmModal.confirmed.subscribe((confirmed: boolean) => {
      if (confirmed && this.productDiseaseToDelete !== null) {
        this.productDiseaseService.deleteProductDisease(this.productDiseaseToDelete)
          .subscribe(() => {
            this.productDiseases = this.productDiseases.filter(pd => pd.id !== this.productDiseaseToDelete);
            this.totalPages = Math.ceil(this.productDiseases.length / this.itemsPerPage);
            this.paginateProductDiseases();
            this.showSuccess("Product-Disease relationship deleted successfully");
          }, error => this.showError("Failed to delete Product-Disease relationship"));
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
    this.getProductDiseases();
  }

  paginateProductDiseases(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedProductDiseases = this.productDiseases.slice(start, end);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginateProductDiseases();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateProductDiseases();
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
}
