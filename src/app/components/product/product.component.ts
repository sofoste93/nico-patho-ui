import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product, NewProduct } from '../../models/product';
import { FirmService } from '../../services/firm.service';
import { Firm } from '../../models/firm';
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
  selector: 'app-product',
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

  constructor(
    private productService: ProductService,
    private firmService: FirmService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.getFirms();
  }

  getProducts(): void {
    this.productService.getProducts()
      .subscribe({
        next: products => {
          this.products = products;
          this.totalPages = Math.ceil(this.products.length / this.itemsPerPage);
          this.paginateProducts();
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
            this.totalPages = Math.ceil(this.products.length / this.itemsPerPage);
            this.paginateProducts();
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

  addProduct(): void {
    if (this.newProduct.brandName && this.newProduct.firmId) {
      this.productService.createProduct(this.newProduct)
        .subscribe({
          next: product => {
            this.products.push(product);
            this.totalPages = Math.ceil(this.products.length / this.itemsPerPage);
            this.paginateProducts();
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
              this.showForm = false;
              this.showList = true;
              this.showSuccess("Product updated successfully");
            }
          },
          error: error => this.showError("Failed to update product")
        });
    }
  }

  deleteProduct(id: number): void {
    this.productService.deleteProduct(id)
      .subscribe({
        next: () => {
          this.products = this.products.filter(p => p.id !== id);
          this.totalPages = Math.ceil(this.products.length / this.itemsPerPage);
          this.paginateProducts();
          this.showSuccess("Product deleted successfully");
        },
        error: error => this.showError("Failed to delete product")
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

  paginateProducts(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedProducts = this.products.slice(start, end);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginateProducts();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateProducts();
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
