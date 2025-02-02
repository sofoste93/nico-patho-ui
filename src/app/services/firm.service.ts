import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Firm, NewFirm } from '../models/firm';

@Injectable({
  providedIn: 'root'
})
export class FirmService {

  private apiUrl = 'http://localhost:8080/firms';

  constructor(private http: HttpClient) { }

  getFirms(): Observable<Firm[]> {
    return this.http.get<Firm[]>(this.apiUrl);
  }

  searchFirms(query: string): Observable<Firm[]> {
    return this.http.get<Firm[]>(`${this.apiUrl}?search=${query}`);
  }

  createFirm(firm: NewFirm): Observable<Firm> {
    return this.http.post<Firm>(this.apiUrl, firm);
  }

  updateFirm(id: number, firm: Firm): Observable<Firm> {
    return this.http.put<Firm>(`${this.apiUrl}/${id}`, firm);
  }

  deleteFirm(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
