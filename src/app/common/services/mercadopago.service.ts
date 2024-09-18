import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AngularFirestore, DocumentReference } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class MercadoPagoService {
  private apiUrl = ' https://2b3gbb4p-3333.brs.devtunnels.ms/create_preference';  // Ruta del servidor backend

  constructor(private http: HttpClient, private firestore: AngularFirestore) {}

  // Método para enviar la orden de pago al servidor backend
  sendPaymentData(paymentData: any): Observable<any> {
    const url = `${this.apiUrl}`;
    return this.http.post(url, paymentData);
  }

  // Método para guardar el estado de pago en Firestore
  // savePaymentStatus(userId: string, paymentData: any): Promise<DocumentReference> {
  //   return this.firestore.collection('usuarios').doc(userId).collection('payments').add(paymentData);
  // }
}
