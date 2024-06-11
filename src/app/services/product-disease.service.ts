// product-disease.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {ProductDisease} from "../models/disease";


@Injectable({
  providedIn: 'root'
})
export class ProductDiseaseService {
  private apiUrl = 'http://localhost:8080/product-diseases';

  constructor(private http: HttpClient) { }

  getProductDiseasesByDiseaseId(diseaseId: number): Observable<ProductDisease[]> {
    return this.http.get<ProductDisease[]>(`${this.apiUrl}?diseaseId=${diseaseId}`);
  }

  getProductDiseasesByProductId(productId: number): Observable<ProductDisease[]> {
    return this.http.get<ProductDisease[]>(`${this.apiUrl}?productId=${productId}`);
  }
}
