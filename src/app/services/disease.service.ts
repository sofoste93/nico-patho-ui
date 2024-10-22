import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Disease, NewDisease, ProductDisease} from '../models/disease';

@Injectable({
  providedIn: 'root'
})
export class DiseaseService {
  private apiUrl = 'http://localhost:8080/diseases';
  private productDiseaseUrl = 'http://localhost:8080/product-diseases';

  constructor(private http: HttpClient) { }

  getDiseases(): Observable<Disease[]> {
    return this.http.get<Disease[]>(this.apiUrl);
  }

  getDisease(id: number): Observable<Disease> {
    return this.http.get<Disease>(`${this.apiUrl}/${id}`);
  }

  createDisease(newDisease: NewDisease): Observable<Disease> {
    return this.http.post<Disease>(this.apiUrl, newDisease);
  }

  updateDisease(id: number, disease: Disease): Observable<Disease> {
    return this.http.put<Disease>(`${this.apiUrl}/${id}`, disease);
  }

  deleteDisease(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchDiseases(query: string): Observable<Disease[]> {
    return this.http.get<Disease[]>(`${this.apiUrl}?search=${query}`);
  }

  getProductDiseases(diseaseId: number): Observable<ProductDisease[]> {
    return this.http.get<ProductDisease[]>(`${this.productDiseaseUrl}?diseaseId=${diseaseId}`);
  }
}
