import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {NewProductDisease, ProductDisease} from "../models/product-disease.model";


@Injectable({
  providedIn: 'root'
})
export class ProductDiseaseService {
  private apiUrl = 'http://localhost:8080/product-diseases';

  constructor(private http: HttpClient) { }

  getProductDiseases(): Observable<ProductDisease[]> {
    return this.http.get<ProductDisease[]>(this.apiUrl);
  }

  getProductDisease(id: number): Observable<ProductDisease> {
    return this.http.get<ProductDisease>(`${this.apiUrl}/${id}`);
  }

  createProductDisease(productDisease: NewProductDisease): Observable<ProductDisease> {
    return this.http.post<ProductDisease>(this.apiUrl, productDisease);
  }

  updateProductDisease(id: number, productDisease: ProductDisease): Observable<ProductDisease> {
    return this.http.put<ProductDisease>(`${this.apiUrl}/${id}`, productDisease);
  }

  deleteProductDisease(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
