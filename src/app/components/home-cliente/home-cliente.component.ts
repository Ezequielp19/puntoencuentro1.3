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
  filteredCategories: CategoryI[] = [];
  cities: string[] = [];
  filteredCities: string[] = [];
  selectedCategory: string = '';
  selectedCity: string = '';
  searchTerm: string = ''; // Variable para el término de búsqueda
  categorySearchTerm: string = ''; // Variable para el término de búsqueda de categorías
  citySearchTerm: string = ''; // Variable para el término de búsqueda de ciudades

  constructor(private router: Router, private firestoreService: FirestoreService) {}

  ngOnInit() {
    this.loadServices();
    this.loadCategories();
  }

  async loadServices() {
    this.services = await this.firestoreService.getServices();
    this.filteredServices = this.services;
    this.cities = [...new Set(this.services.map(service => service.ciudad))];
    this.filteredCities = this.cities; // Inicializa con todas las ciudades
    this.paginateServices();
  }

  loadCategories() {
    this.firestoreService.getCollectionChanges<CategoryI>('Categorías').subscribe(data => {
      if (data) {
        this.categories = data;
        this.filteredCategories = data; // Inicializa con todas las categorías
      }
    });
  }

  filterServicesByCategory(categoryId: string) {
    this.selectedCategory = categoryId;
    this.applyFilters();
  }

  filterServicesByCity(city: string) {
    this.selectedCity = city;
    this.applyFilters();
  }

  filterServices(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    this.applyFilters();
  }

  filterCategories(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredCategories = this.categories.filter(category => category.nombre.toLowerCase().includes(searchTerm));
  }

  filterCities(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredCities = this.cities.filter(city => city.toLowerCase().includes(searchTerm));
  }

  applyFilters() {
    this.filteredServices = this.services.filter(service => {
      const matchesCategory = this.selectedCategory ? service.category === this.selectedCategory : true;
      const matchesCity = this.selectedCity ? service.ciudad === this.selectedCity : true;
      const matchesSearch = service.nombreEmpresa.toLowerCase().includes(this.searchTerm) ||
                            service.description.toLowerCase().includes(this.searchTerm) ||
                            service.ciudad.toLowerCase().includes(this.searchTerm);
      return matchesCategory && matchesCity && matchesSearch;
    });
    this.paginateServices();
  }

  clearFilters() {
    this.selectedCategory = '';
    this.selectedCity = '';
    this.searchTerm = '';
    this.filteredServices = this.services;
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
    // Añade un retraso de 1 segundo antes de navegar
    setTimeout(() => {
      this.router.navigate(['/serviceDetail', serviceId]);
    }, 500); // 1000 ms = 1 segundo
  }

  goToProfile() {
    this.router.navigate(['/perfil']);
  }
}
