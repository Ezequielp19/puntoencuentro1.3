import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auction } from '../../common/models/subasta.model';
import { FirestoreService } from '../../common/services/firestore.service';

import { AuthService } from 'src/app/common/services/auth.service';
import { Router } from '@angular/router';
import { CountdownModule } from 'ngx-countdown';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { ModalController, IonSearchbar, IonHeader, IonContent, IonTitle, IonLabel, IonToolbar, IonButton, IonButtons, IonMenuButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonInput, IonList, IonSelect, IonSelectOption } from '@ionic/angular/standalone';

@Component({
  selector: 'app-crear-subasta',
  templateUrl: './crear-subasta.component.html',
  styleUrls: ['./crear-subasta.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonHeader, IonContent, IonTitle, IonLabel,
    IonToolbar, IonButton, IonButtons, IonMenuButton,
    IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonInput,
    IonSearchbar, IonList, IonSelect, IonSelectOption, CountdownModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CrearSubastaComponent implements OnInit {
  auction: Auction = {
    id: '',
    city: '',
    currentWinningPrice: 0,
    winningUserId: '',
    createdAt: '',
    endTime: '',
    isPaid: false,
    isActive: true,
    isFinished: false,
    winningUserName: '',
    serviceId: ''
  };

  auctions: Auction[] = [];
  cities: string[] = [];
  filteredCities: string[] = [];
  selectedCityName: string = '';
  citySearchTerm: string = '';
  isCityDropdownOpen: boolean = false;
  showForm: boolean = false;

  intervalIds: { [key: string]: any } = {};  // Guardar intervalos por subasta

  showAuctionModal = false;  // Inicialmente no se muestra el modal
  selectedAuction: Auction | null = null;

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.loadCities();
    this.loadAuctions();
  }

  toggleCityDropdown() {
    this.isCityDropdownOpen = !this.isCityDropdownOpen;
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  // Método para cargar el nombre del usuario ganador
  loadUserDetails(winningUserId: string): Promise<string> {
    return this.firestoreService.getUserById(winningUserId)
      .then(user => user?.nombre || 'Desconocido')
      .catch(() => 'Desconocido');
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

  loadCities() {
    this.firestoreService.getServices().then((services) => {
      this.cities = [...new Set(services.map((service) => service.ciudad))];
      this.filteredCities = this.cities;
    });
  }

  loadAuctions() {
    this.firestoreService.getAllAuctions().then((auctions) => {
      this.auctions = auctions;
      this.auctions.forEach((auction) => {
        this.loadUserDetails(auction.winningUserId).then(nombre => {
          auction.winningUserName = nombre;
        });
        if (auction.isActive) {
          this.startAuctionInterval(auction);  // Iniciar el intervalo
        }
      });
    });
  }

// Método para crear un intervalo que se ejecute cada hora
startAuctionInterval(auction: Auction) {
  // Si ya hay un intervalo activo, no hacemos nada
  if (this.intervalIds[auction.id]) {
    return;
  }

  this.intervalIds[auction.id] = setInterval(() => {
    console.log(`Revisando estado de la subasta: ${auction.city}`);

    const currentTime = new Date();
    const endTime = new Date(auction.endTime);

    if (currentTime >= endTime) {
      // Si la subasta ya ha terminado
      auction.isFinished = true;
      auction.isActive = false;

      this.firestoreService.updateAuction(auction.id, { isFinished: true, isActive: false })
        .then(() => {
          console.log(`Subasta en ${auction.city} ha finalizado.`);
          // Limpiar el intervalo ya que la subasta ha terminado
          clearInterval(this.intervalIds[auction.id]);
          delete this.intervalIds[auction.id];
        })
        .catch((error) => {
          console.error('Error al finalizar la subasta:', error);
        });
    } else {
      // Subasta sigue activa, solo actualizamos su estado
      this.firestoreService.updateAuction(auction.id, { isActive: auction.isActive })
        .then(() => {
          console.log(`Subasta en ${auction.city} actualizada.`);
        })
        .catch((error) => {
          console.error('Error al actualizar la subasta:', error);
        });
    }
  }, 3600 * 1000);  // Intervalo de 1 hora
}


  createAuction() {
    if (this.auction.city && this.auction.currentWinningPrice > 0) {
      this.auction.createdAt = new Date(this.auction.createdAt).toISOString();
      this.auction.endTime = new Date(this.auction.endTime).toISOString();

      this.firestoreService.createAuction(this.auction)
        .then(() => {
          console.log('Subasta creada con éxito');
          this.showForm = false;
          this.loadAuctions();
        })
        .catch((error) => {
          console.error('Error al crear la subasta:', error);
        });
    }
  }

  toggleAuctionStatus(auction: Auction) {
    auction.isActive = !auction.isActive;

    if (!auction.isActive && this.intervalIds[auction.id]) {
      clearInterval(this.intervalIds[auction.id]);  // Detenemos el intervalo
      delete this.intervalIds[auction.id];  // Eliminamos la referencia al intervalo
    } else if (auction.isActive) {
      this.startAuctionInterval(auction);  // Iniciar el intervalo nuevamente si se activa
    }

    this.firestoreService.updateAuction(auction.id, { isActive: auction.isActive })
      .then(() => {
        console.log(`Subasta en ${auction.city} actualizada.`);
      });
  }

  deleteAuction(auctionId: string) {
    this.firestoreService.deleteAuction(auctionId)
      .then(() => {
        console.log('Subasta eliminada con éxito.');
        this.loadAuctions();
      })
      .catch((error: any) => {
        console.error('Error al eliminar la subasta:', error);
      });
  }

  toggleAuctionModal(auction: Auction) {
    this.showAuctionModal = !this.showAuctionModal;
    this.selectedAuction = auction;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }


    // Método para manejar el cambio de estado de la subasta
    onAuctionStatusChange(auction: Auction) {
      auction.isActive = auction.isActive === true;

      // Si la subasta está inactiva, solo detener el temporizador
      if (!auction.isActive && this.intervalIds[auction.id]) {
        clearInterval(this.intervalIds[auction.id]);  // Pausa el temporizador
      }

      this.firestoreService
        .updateAuction(auction.id, { isActive: auction.isActive })
        .then(() => {
          console.log(`Subasta en ${auction.city} actualizada.`);
        })
        .catch((error) => {
          console.error('Error al actualizar el estado de la subasta:', error);
        });
    }
}
