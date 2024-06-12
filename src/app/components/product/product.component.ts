import { Component, OnInit, ViewChild } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product, NewProduct } from '../../models/product';
import { FirmService } from '../../services/firm.service';
import { Firm } from '../../models/firm';
import { FormsModule } from '@angular/forms';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfirmModalBootstrapComponent } from '../confirm-modal-bootstrap/confirm-modal-bootstrap.component';
import {TranslateModule} from "@ngx-translate/core";

declare var bootstrap: any;

type SortableProductFields = 'brandName' | 'nicotineContent' | 'tarContent' | 'condensateContent';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    HttpClientModule,
    MatSnackBarModule,
    NgIf,
    ConfirmModalBootstrapComponent,
    NgClass,
    TranslateModule
  ],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  products: Product[] = [];
  paginatedProducts: Product[] = [];
  newProduct: NewProduct = { brandName: '', nicotineContent: 0, tarContent: 0, condensateContent: 0, firmId: null };
  firms: Firm[] = [];
  searchQuery: string = '';
  showForm: boolean = false;
  showSearch: boolean = false;
  showList: boolean = false;
  selectedProduct: Product | null = null;
  currentPage: number = 1;
  itemsPerPage: number = 4;
  totalPages: number = 1;
  productToDelete: number | null = null;
  sortField: SortableProductFields = 'brandName'; // Default sort field
  sortOrder: 'asc' | 'desc' = 'asc'; // or 'desc'

  @ViewChild(ConfirmModalBootstrapComponent) confirmModal!: ConfirmModalBootstrapComponent;

  constructor(
    private productService: ProductService,
    private firmService: FirmService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.getFirms();
    this.getProducts();
  }

  getProducts(): void {
    this.productService.getProducts()
      .subscribe({
        next: products => {
          this.products = products;
          this.applyFilter();
        },
        error: error => this.showError("Failed to fetch products")
      });
  }

  getFirms(): void {
    this.firmService.getFirms()
      .subscribe({
        next: firms => this.firms = firms,
        error: error => this.showError("Failed to fetch firms")
      });
  }

  searchProducts(): void {
    if (this.searchQuery.trim()) {
      this.productService.searchProducts(this.searchQuery)
        .subscribe({
          next: products => {
            this.products = products;
            this.applyFilter();
            if (products.length === 0) {
              this.showError("No products found");
            }
          },
          error: error => this.showError("Failed to search products")
        });
    } else {
      this.getProducts();
    }
  }

  applyFilter(): void {
    let filteredProducts = this.products;
    this.sortProducts(filteredProducts);
  }

  sortProducts(products: Product[]): void {
    if (this.sortField) {
      products.sort((a, b) => {
        let comparison = 0;
        if ((a[this.sortField] as any) > (b[this.sortField] as any)) {
          comparison = 1;
        } else if ((a[this.sortField] as any) < (b[this.sortField] as any)) {
          comparison = -1;
        }
        return this.sortOrder === 'asc' ? comparison : -comparison;
      });
    }
    this.totalPages = Math.ceil(products.length / this.itemsPerPage);
    this.paginateProducts(products);
  }

  setSortField(field: SortableProductFields): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc';
    }
    this.applyFilter();
  }

  addProduct(): void {
    if (this.newProduct.brandName && this.newProduct.firmId) {
      this.productService.createProduct(this.newProduct)
        .subscribe({
          next: product => {
            this.products.push(product);
            this.applyFilter();
            this.newProduct = { brandName: '', nicotineContent: 0, tarContent: 0, condensateContent: 0, firmId: null };
            this.showSuccess("Product added successfully");
          },
          error: error => this.showError("Failed to add product")
        });
    }
  }

  editProduct(product: Product): void {
    this.selectedProduct = { ...product };
    this.showForm = true;
    this.showList = false;
    this.showSearch = false;
  }

  updateProduct(): void {
    if (this.selectedProduct && this.selectedProduct.brandName && this.selectedProduct.firm?.id) {
      this.productService.updateProduct(this.selectedProduct.id, this.selectedProduct)
        .subscribe({
          next: updatedProduct => {
            const index = this.products.findIndex(p => p.id === updatedProduct.id);
            if (index !== -1) {
              this.products[index] = updatedProduct;
              this.selectedProduct = null;
              this.applyFilter();
              this.showForm = false;
              this.showList = true;
              this.showSuccess("Product updated successfully");
            }
          },
          error: error => this.showError("Failed to update product")
        });
    }
  }

  confirmDeleteProduct(id: number): void {
    this.productToDelete = id;
    this.openModal();
    this.confirmModal.confirmed.subscribe((confirmed: boolean) => {
      if (confirmed && this.productToDelete !== null) {
        this.productService.deleteProduct(this.productToDelete)
          .subscribe({
            next: () => {
              this.products = this.products.filter(p => p.id !== this.productToDelete);
              this.applyFilter();
              this.showSuccess("Product deleted successfully");
            },
            error: error => this.showError("Failed to delete product")
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
    this.getProducts();
  }

  paginateProducts(products: Product[]): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedProducts = products.slice(start, end);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilter();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilter();
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
