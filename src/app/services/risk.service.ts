// risk.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Risk} from "../models/Risk";


@Injectable({
  providedIn: 'root'
})
export class RiskService {
  private apiUrl = 'http://localhost:8080/product-diseases';

  constructor(private http: HttpClient) { }

  getRisks(): Observable<Risk[]> {
    return this.http.get<Risk[]>(this.apiUrl);
  }
}
