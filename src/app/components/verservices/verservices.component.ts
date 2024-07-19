import { Component, OnInit } from '@angular/core';
import { FirestoreService } from 'src/app/common/services/firestore.service';
import { Service } from 'src/app/common/models/service.models';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from 'src/app/common/services/auth.service';
import { Router } from '@angular/router';
import {
  IonSearchbar,IonItem, IonButton, IonLabel, IonInput, IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonList, IonCardContent, IonToolbar, IonAvatar, IonTitle, IonHeader, IonBackButton, IonButtons, IonSpinner, IonSelectOption, IonSelect, IonMenuButton, IonIcon
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-verservices',
  templateUrl: './verservices.component.html',
  styleUrls: ['./verservices.component.scss'],
  standalone: true,
  imports: [
    IonSearchbar,IonSpinner, IonButtons, IonBackButton, IonHeader, IonTitle, IonToolbar, IonItem, IonInput, IonLabel, IonContent, IonGrid, IonRow, IonCol, IonAvatar, IonCard, IonCardHeader, IonCardTitle, IonList, IonCardContent, CommonModule, FormsModule, ReactiveFormsModule, IonSelectOption, IonSelect, IonButton, IonMenuButton, IonIcon
  ],
})

export class VerservicesComponent implements OnInit {
  services: Service[] = [];
  pagedServices: Service[][] = [];
  currentPage = 0;
  pageSize = 10; // Ajusta el tamaño de página según sea necesario

  categories : any = []; // Llena esto con tus categorías
  cities: any = []; // Llena esto con tus ciudades

  constructor(private firestoreService: FirestoreService, private router: Router, private authService: AuthService) { }

  ngOnInit() {
    this.loadServices();
  }

  async loadServices() {
    try {
      this.services = await this.firestoreService.getAllServices();
      this.setupPagination();
      console.log(this.services);
    } catch (error) {
      console.error('Error al obtener los servicios:', error);
    }
  }

  setupPagination() {
    const pages = [];
    for (let i = 0; i < this.services.length; i += this.pageSize) {
      pages.push(this.services.slice(i, i + this.pageSize));
    }
    this.pagedServices = pages;
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.pagedServices.length - 1) {
      this.currentPage++;
    }
  }

  filterServices(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    if (searchTerm && searchTerm.trim() !== '') {
      this.services = this.services.filter(service => service.nombreEmpresa.toLowerCase().includes(searchTerm));
      this.setupPagination();
    } else {
      this.loadServices();
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToService(serviceId: string) {
    this.router.navigate(['/serviceDetail', serviceId]);
  }
}
