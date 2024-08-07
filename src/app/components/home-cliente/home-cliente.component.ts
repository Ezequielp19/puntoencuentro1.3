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
  IonModal,
  IonMenuButton,
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
import { AuthService } from 'src/app/common/services/auth.service';

@Component({
  selector: 'app-home-cliente',
  templateUrl: './home-cliente.component.html',
  styleUrls: ['./home-cliente.component.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonModal,
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
    IonMenuButton,
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
  isCategoryModalOpen: boolean = false;
  selectedCategoryName: string = '';
  isCityDropdownOpen: boolean = false;
  selectedCityName: string = '';

  isDropdownOpen = false;
  constructor(private router: Router, private firestoreService: FirestoreService,
    private authService: AuthService,
  ) {}

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
      if (data && data.length > 0) {
        this.categories = data;
        this.filteredCategories = data;
      } else {
        this.filteredCategories = []; // Asegurarse de que esté inicializada
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
    this.categorySearchTerm = ''; // Reiniciar el término de búsqueda de categorías
    this.citySearchTerm = ''; // Reiniciar el término de búsqueda de ciudades
    this.selectedCategoryName = ''; // Reiniciar el nombre de la categoría seleccionada
    this.selectedCityName = ''; // Reiniciar el nombre de la ciudad seleccionada
    this.filteredCategories = this.categories; // Reiniciar el filtro de categorías
    this.filteredCities = this.cities; // Reiniciar el filtro de ciudades
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

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  openCategoryModal() {
    this.isCategoryModalOpen = true;
  }

  dismissCategoryModal() {
    this.isCategoryModalOpen = false;
  }

  selectCategory(category: CategoryI) {
    this.selectedCategory = category.id;
    this.selectedCategoryName = category.nombre; // Guardar el nombre de la categoría seleccionada
    this.toggleDropdown();
    this.filterServicesByCategory(category.id);
  }

  toggleCityDropdown() {
    this.isCityDropdownOpen = !this.isCityDropdownOpen;
  }

  selectCity(city: string) {
    this.selectedCity = city;
    this.selectedCityName = city; // Guardar el nombre de la ciudad seleccionada
    this.toggleCityDropdown();
    this.filterServicesByCity(city);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
