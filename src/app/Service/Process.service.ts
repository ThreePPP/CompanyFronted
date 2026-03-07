import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProcessService {
  private readonly apiUrl = 'https://localhost:7176';

  constructor(private http: HttpClient) {}

  GetAllCBEs(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Process/GetAllCBEs`);
  }

  GetAllTrashCBEs(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Process/GetAllTrashCBEs`);
  }

  TrashCBE(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/Process/TrashCBE/${id}`, {});
  }

  RestoreCBE(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/Process/RestoreCBE/${id}`, {});
  }

  DeleteCBE(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Process/DeleteCBE/${id}`);
  }

  GetCBEById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Process/GetCBEsById/${id}`);
  }

  UpdateCBE(id: number, body: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/Process/UpdateCBEs/${id}`, body);
  }
}
