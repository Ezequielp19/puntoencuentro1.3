import {
  IonItem,
  IonButton,
  IonLabel,
  IonInput,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonCardContent,
  IonToolbar,
  IonTitle,
  IonHeader,
  IonBackButton,
  IonButtons,
  IonSpinner,
  IonSelectOption,
  IonSelect,
  IonSearchbar,
  IonAvatar,
  IonIcon
} from '@ionic/angular/standalone';
import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../../common/services/firestore.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Service } from 'src/app/common/models/service.models';
import { CategoryI } from 'src/app/common/models/categoria.model';
import { IoniconsModule } from 'src/app/common/modules/ionicons.module';

@Component({
  selector: 'app-home-cliente',
  templateUrl: './home-cliente.component.html',
  styleUrls: ['./home-cliente.component.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonAvatar,
    IonSearchbar,
    IonSpinner,
    IonButtons,
    IonBackButton,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonInput,
    IonLabel,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonList,
    IonCardContent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonSelectOption,
    IonSelect,
    IonButton,
    IonIcon,
    IoniconsModule
  ],
})
export class HomeClienteComponent implements OnInit {
  services: Service[] = [];
  filteredServices: Service[] = [];
  pagedServices: Service[][] = [];
  currentPage: number = 0;
  categories: CategoryI[] = [];
  cities: string[] = [];

  constructor(private router: Router, private firestoreService: FirestoreService) { }

  ngOnInit() {
    this.loadServices();
    this.loadCategories();
  }

  async loadServices() {
    this.services = await this.firestoreService.getServices();
    this.filteredServices = this.services;
    this.cities = [...new Set(this.services.map(service => service.ciudad))];
    this.paginateServices();
  }

  loadCategories() {
    this.firestoreService.getCollectionChanges<CategoryI>('Categorías').subscribe(data => {
      if (data) {
        this.categories = data;
      }
    });
  }

  filterServicesByCategory(categoryId: string) {
    this.filteredServices = this.services.filter(service =>
      service.category === categoryId
    );
    this.paginateServices();
  }

  filterServicesByCity(city: string) {
    this.filteredServices = this.services.filter(service =>
      service.ciudad === city
    );
    this.paginateServices();
  }

  filterServices(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredServices = this.services.filter(service =>
      service.nombreEmpresa.toLowerCase().includes(searchTerm) ||
      service.description.toLowerCase().includes(searchTerm) ||
      service.ciudad.toLowerCase().includes(searchTerm)
    );
    this.paginateServices();
  }

  paginateServices() {
    const pageSize = 5;
    this.pagedServices = [];
    for (let i = 0; i < this.filteredServices.length; i += pageSize) {
      this.pagedServices.push(this.filteredServices.slice(i, i + pageSize));
    }
  }

  nextPage() {
    if (this.currentPage < this.pagedServices.length - 1) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  goToService(serviceId: string) {
    this.router.navigate(['/serviceDetail', serviceId]);
  }

  goToProfile() {
    this.router.navigate(['/perfil']);
  }
}
