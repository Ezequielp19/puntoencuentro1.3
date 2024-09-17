import { IonContent, IonHeader, IonToolbar, IonButton, IonButtons, IonMenuButton, IonTitle, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput } from '@ionic/angular/standalone';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/common/services/auth.service';
import { FirestoreService } from 'src/app/common/services/firestore.service';
import { Auction } from '../../common/models/subasta.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MercadoPagoService } from '../../common/services/mercadopago.service';
import { ChangeDetectorRef } from '@angular/core'; // Importar ChangeDetectorRef

@Component({
  selector: 'app-subasta',
  standalone: true,
  templateUrl: './subasta.component.html',
  styleUrls: ['./subasta.component.scss'],
  imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonButton, IonButtons, IonMenuButton, IonTitle, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, FormsModule]
})
export class SubastaComponent implements OnInit {
  auctions: Auction[] = [];
  userCity: string = '';
  newBidAmount: number = 0;
  intervalIds: { [key: string]: any } = {}; // Para almacenar intervalos

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private mercadoPagoService: MercadoPagoService,
    private router: Router,
    private cd: ChangeDetectorRef // Inyectar ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadUserCityAndAuctions();
  }

  async sendPaymentData(auction: Auction) {
    try {
      const service = await this.firestoreService.getServiceByUserId(auction.winningUserId);

      if (service && service.id) {
        const paymentData = {
          serviceId: service.id, // Asegúrate de que service tiene un campo id
          auctionId: auction.id,
          winningUserId: auction.winningUserId,
          currentWinningPrice: auction.currentWinningPrice
        };
        console.log("paymentdata: " + auction.winningUserId)
        this.mercadoPagoService.sendPaymentData(paymentData).subscribe(
          (response: any) => {
            console.log('Orden de pago enviada con éxito:', response);
            if (response.init_point) {
              window.location.href = response.init_point; // Redirigir al usuario al link de Mercado Pago
            } else {
              console.error('Error: init_point no encontrado en la respuesta.');
            }
          },
          (error: any) => {
            console.error('Error al enviar la orden de pago:', error);
          }
        );
      } else {
        console.error('No se encontró el servicio para el usuario ganador.');
      }
    } catch (error) {
      console.error('Error al obtener el servicio por el ID del usuario ganador:', error);
    }
  }

  // Método para cargar las subastas según la ciudad del usuario
  loadUserCityAndAuctions() {
    this.authService.getCurrentUser().subscribe(async (user) => {
      if (user) {
        try {
          const userService = await this.firestoreService.getServiceByUserId(user.id);
          if (userService) {
            this.userCity = userService.ciudad;
            this.firestoreService.getAuctionsByCity(this.userCity).subscribe((auctions: Auction[]) => {
              this.auctions = auctions.map(auction => ({
                ...auction,
                // El usuario será el ganador solo si el temporizador ha llegado a 0 y la subasta está marcada como finalizada
                isWinningUser: auction.winningUserId === user.id && auction.isFinished
              }));

              this.auctions.forEach(auction => {

              });
            });
          } else {
            console.error('El usuario no tiene un servicio asociado.');
          }
        } catch (error) {
          console.error('Error al cargar las subastas:', error);
        }
      } else {
        console.error('No se pudo obtener el usuario actual.');
      }
    });
  }

  // Método para hacer una puja en una subasta
  placeBid(auction: Auction) {
    this.authService.getCurrentUser().subscribe(currentUser => {
      if (currentUser && this.newBidAmount > auction.currentWinningPrice) {
        this.firestoreService.updateAuction(auction.id, {
          currentWinningPrice: this.newBidAmount,
          winningUserId: currentUser.id
        }).then(() => {
          console.log("Puja realizada con éxito");
        }).catch(error => {
          console.error('Error al actualizar la subasta:', error);
        });
      } else {
        console.error('El monto de la puja debe ser mayor al monto actual.');
      }
    }, error => {
      console.error('Error al obtener el usuario actual:', error);
    });
  }

  // Método para cerrar sesión
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
}
