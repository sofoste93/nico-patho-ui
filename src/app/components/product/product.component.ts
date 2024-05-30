import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';
import { FormsModule } from '@angular/forms';
import { NgForOf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {MatLine} from "@angular/material/core";

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
    MatLine
  ],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  products: Product[] = [];
  newProduct: Product = { id: 0, brandName: '', nicotineContent: 0, tarContent: 0, condensateContent: 0 };

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts(): void {
    this.productService.getProducts()
      .subscribe(products => this.products = products);
  }

  addProduct(): void {
    if (this.newProduct.brandName && this.newProduct.nicotineContent > 0 && this.newProduct.tarContent > 0 && this.newProduct.condensateContent > 0) {
      this.productService.createProduct(this.newProduct)
        .subscribe(product => {
          this.products.push(product);
          this.newProduct = { id: 0, brandName: '', nicotineContent: 0, tarContent: 0, condensateContent: 0 };
        });
    }
  }

  deleteProduct(id: number): void {
    this.productService.deleteProduct(id)
      .subscribe(() => {
        this.products = this.products.filter(p => p.id !== id);
      });
  }
}
