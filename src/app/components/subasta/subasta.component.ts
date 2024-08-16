import { FirestoreService } from '../../common/services/firestore.service'; // Ajusta el path según tu estructura
import { Service } from 'src/app/common/models/service.models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-subasta',
    standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subasta.component.html',
  styleUrls: ['./subasta.component.css']
})
export class SubastaComponent  {

  bidAmount: number = 0;
  errorMessage: string = '';
  successMessage: string = '';
  serviceId: string = ''; // Debes obtener este ID de alguna manera, por ejemplo, desde el usuario autenticado

  constructor(private firestoreService: FirestoreService) {}


  async makeBid() {
    if (!this.bidAmount || this.bidAmount <= 0) {
      this.errorMessage = 'El monto debe ser mayor a cero.';
      this.successMessage = '';
      return;
    }

    try {
      const serviceData: Partial<Service> = {
        bidAmount: this.bidAmount,
        paymentDate: new Date() // Registramos la fecha de la oferta
      };

      await this.firestoreService.updateService(this.serviceId, serviceData);

      this.successMessage = 'Oferta realizada exitosamente.';
      this.errorMessage = '';
      this.bidAmount = 0; // Reseteamos el valor de la oferta

    } catch (error) {
      console.error('Error al realizar la oferta:', error);
      this.errorMessage = 'Hubo un error al realizar la oferta. Inténtalo nuevamente.';
      this.successMessage = '';
    }
  }

}
