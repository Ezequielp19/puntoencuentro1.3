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
  imports: [CommonModule, FormsModule, IonHeader,IonContent,IonTitle,IonLabel,
    IonToolbar, IonButton,IonButtons, IonMenuButton,
    IonIcon, IonCard,IonCardHeader,IonCardTitle,IonCardContent,IonItem,IonInput,
    IonSearchbar, IonList,IonSelect,IonSelectOption,CountdownModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CrearSubastaComponent implements OnInit {
  auction: Auction = {
    id: '',
    city: '',
    currentWinningPrice: 0,
    winningUserId: '',
    duration: 0,
    createdAt: new Date(),
    endTime: new Date(),
    timeRemaining: 0,
    isActive: true,
    lastUpdatedAt: new Date(),
    isFinished: false,
    winningUserName:'',
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
    private cd: ChangeDetectorRef,  // Injectar ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCities();
    this.loadAuctions();
  }

  // toggleAuctionModal(auction: Auction) {
  //   this.showAuctionModal = !this.showAuctionModal;
  //   this.selectedAuction = auction;
  // }

  toggleCityDropdown() {
    this.isCityDropdownOpen = !this.isCityDropdownOpen;
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  loadUserDetails(winningUserId: string): Promise<string> {
    return this.firestoreService.getUserById(winningUserId)
      .then(user => {
        // console.log('Nombre del usuario cargado: ', user?.nombre);
        return user?.nombre || 'Desconocido';
      })
      .catch((error) => {
        console.error('Error al cargar el usuario: ', error);
        return 'Desconocido';
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
        // Cargar el nombre del usuario ganador
        this.loadUserDetails(auction.winningUserId).then(nombre => {
          auction.winningUserName = nombre; // Añadir un campo temporal para el nombre
        });
        this.startCountdown(auction);
      });
    });
  }

  toggleAuctionModal(auction: Auction) {
    this.showAuctionModal = !this.showAuctionModal;  // Alterna la visibilidad del modal
    this.selectedAuction = auction;

    // if (auction) {

    //   console.log(`Subasta terminada: ${auction.isFinished}`);
    //   console.log(`Subasta pagada: ${auction.isPaid}`);
    //   console.log(`Subasta activa: ${auction.isActive}`);
    // }
  }

  createAuction() {
    if (this.auction.city && this.auction.currentWinningPrice > 0 && this.auction.duration > 0) {
      this.auction.createdAt = new Date();
      this.auction.endTime = new Date(
        this.auction.createdAt.getTime() + this.auction.duration * 3600000
      );

      const now = new Date();
      this.auction.timeRemaining = Math.floor(
        (this.auction.endTime.getTime() - now.getTime()) / 1000
      );

      this.firestoreService
        .createAuction(this.auction)
        .then(() => {
          console.log('Subasta creada con éxito');
          this.showForm = false;
          this.loadAuctions();
        })
        .catch((error) => {
          console.error('Error al crear la subasta: ', error);
        });

      this.startCountdown(this.auction);
    }
  }

  startCountdown(auction: Auction) {
    if (auction.timeRemaining > 0 && auction.isActive) {
      this.intervalIds[auction.id] = setInterval(() => {
        auction.timeRemaining--;

        if (auction.timeRemaining <= 0) {
          clearInterval(this.intervalIds[auction.id]);
          auction.isFinished = true;
        }

        // Usamos ChangeDetectorRef para asegurarnos de que Angular detecte cambios
        this.cd.detectChanges();
      }, 1000);

      setInterval(() => {
        this.firestoreService.updateAuction(auction.id, {
          timeRemaining: auction.timeRemaining,
          lastUpdatedAt: new Date(),
          isFinished: auction.isFinished,
        }).catch(error => {
          console.error('Error al actualizar el tiempo restante:', error);
        });
      }, 30000);
    }
  }


  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }

  toggleAuctionStatus(auction: Auction) {
    auction.isActive = !auction.isActive;

    if (!auction.isActive && this.intervalIds[auction.id]) {
      clearInterval(this.intervalIds[auction.id]);  // Aquí se corrige el uso de clearInterval
    } else if (auction.isActive) {
      this.startCountdown(auction);
    }

    this.firestoreService
      .updateAuction(auction.id, { isActive: auction.isActive })
      .then(() => {
        console.log(`Subasta en ${auction.city} actualizada.`);
      });
  }

  deleteAuction(auctionId: string) {
    this.firestoreService
      .deleteAuction(auctionId)
      .then(() => {
        console.log('Subasta eliminada con éxito.');
        this.loadAuctions();
      })
      .catch((error: any) => {
        console.error('Error al eliminar la subasta: ', error);
      });
  }

  // Método para manejar el cambio de estado de la subasta
  onAuctionStatusChange(auction: Auction) {
    auction.isActive = auction.isActive === true;

    // Si la subasta está inactiva, solo detener el temporizador
    if (!auction.isActive && this.intervalIds[auction.id]) {
      clearInterval(this.intervalIds[auction.id]);  // Pausa el temporizador
    }
    // Si la subasta se activa nuevamente, reanudar el temporizador desde el tiempo restante
    else if (auction.isActive) {
      this.startCountdown(auction);  // Reanudar el temporizador
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

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
