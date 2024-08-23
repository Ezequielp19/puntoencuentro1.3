import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auction } from '../../common/models/subasta.model';
import { FirestoreService } from '../../common/services/firestore.service';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/common/services/auth.service';
import { Router } from '@angular/router';
import { CountdownEvent, CountdownModule } from 'ngx-countdown';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';  // Importar CUSTOM_ELEMENTS_SCHEMA

@Component({
  selector: 'app-crear-subasta',
  templateUrl: './crear-subasta.component.html',
  styleUrls: ['./crear-subasta.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, CountdownModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],  // Agregar CUSTOM_ELEMENTS_SCHEMA aquí
})
export class CrearSubastaComponent implements OnInit {
  auction: Auction = {
    id: '',
    city: '',
    initialPrice: 0,
    currentWinningPrice: 0,
    winningUserId: '',
    duration: 0,
    createdAt: new Date(),
    endTime: new Date(),
    timeRemaining: 0
  };

  auctions: Auction[] = [];
  cities: string[] = [];
  filteredCities: string[] = [];
  selectedCityName: string = '';
  citySearchTerm: string = '';
  isCityDropdownOpen: boolean = false;
  showForm: boolean = false;

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCities();
    this.loadAuctions();
  }

  loadCities() {
    this.firestoreService.getServices().then((services) => {
      this.cities = [...new Set(services.map((service) => service.ciudad))];
      this.filteredCities = this.cities;
    });
  }

  loadAuctions() {
    this.firestoreService.getAllAuctions().then((auctions) => {
      this.auctions = auctions;
    });
  }

  filterCities(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredCities = this.cities.filter((city) =>
      city.toLowerCase().includes(searchTerm)
    );
  }

  selectCity(city: string) {
    this.auction.city = city;
    this.selectedCityName = city;
    this.toggleCityDropdown();
  }

  toggleCityDropdown() {
    this.isCityDropdownOpen = !this.isCityDropdownOpen;
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  createAuction() {
    if (this.auction.city && this.auction.initialPrice > 0 && this.auction.duration > 0) {
      this.auction.createdAt = new Date();
      this.auction.endTime = new Date(
        this.auction.createdAt.getTime() + this.auction.duration * 3600000
      );

      // Calcula el tiempo restante en segundos
      const now = new Date();
      this.auction.timeRemaining = Math.floor((this.auction.endTime.getTime() - now.getTime()) / 1000);

      this.firestoreService.createAuction(this.auction)
        .then(() => {
          console.log('Subasta creada con éxito');
          this.showForm = false;
          this.loadAuctions();
        })
        .catch((error) => {
          console.error('Error al crear la subasta: ', error);
        });
    }
  }

  finalizeAuction(auction: Auction) {
    auction.winningUserId = 'usuarioFinalGanador';

    this.firestoreService.updateAuction(auction.id, {
      winningUserId: auction.winningUserId,
      currentWinningPrice: auction.currentWinningPrice
    }).then(() => {
      console.log(`La subasta en ${auction.city} ha finalizado.`);
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  handleCountdown(event: any, auction: Auction) {
    if (event.action === 'done') {
      this.finalizeAuction(auction);
    }
  }

}
