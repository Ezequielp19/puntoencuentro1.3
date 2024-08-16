import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MercadoPagoService {
  private accessToken = 'APP_USR-914576361690041-081618-57242d0c8d98478b8805ff7ea9065e50-1842406931'; // Reemplaza con tu access_token de Mercado Pago

  constructor(private http: HttpClient) {}

  createPreference(preferenceData: any): Observable<any> {
    const url = `https://api.mercadopago.com/checkout/preferences?access_token=${this.accessToken}`;
    return this.http.post(url, preferenceData);
  }
}
