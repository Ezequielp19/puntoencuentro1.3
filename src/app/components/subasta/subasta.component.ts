import { IonicModule } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/common/services/auth.service';
import { FirestoreService } from 'src/app/common/services/firestore.service';
import { Auction } from '../../common/models/subasta.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MercadoPagoService } from '../../common/services/mercadopago.service';

@Component({
  selector: 'app-subasta',
  standalone: true,
  templateUrl: './subasta.component.html',
  styleUrls: ['./subasta.component.scss'],
  imports: [CommonModule, IonicModule, FormsModule]
})
export class SubastaComponent implements OnInit {
  auctions: Auction[] = [];
  userCity: string = '';
  newBidAmount: number = 0;

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private mercadoPagoService: MercadoPagoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserCityAndAuctions();
  }

  // Método para enviar la orden de pago al backend y redireccionar al init_point
  sendPaymentData(auction: Auction) {
    const paymentData = {
      auctionId: auction.id,
      winningUserId: auction.winningUserId,
      currentWinningPrice: auction.currentWinningPrice
    };

    this.mercadoPagoService.sendPaymentData(paymentData).subscribe(
      (response: any) => {
        console.log('Orden de pago enviada con éxito:', response);
        // Redireccionar al init_point devuelto por Mercado Pago
        if (response.init_point) {
          window.location.href = response.init_point;
        } else {
          console.error('Error: init_point no encontrado en la respuesta.');
        }
      },
      (error: any) => {
        console.error('Error al enviar la orden de pago:', error);
      }
    );
  }

  // Método para calcular el tiempo restante de la subasta
  getRemainingTime(startTime: Date, duration: number): string {
    const now = Date.now();
    const start = new Date(startTime).getTime();
    const end = start + duration * 3600000;
    const remaining = end - now;

    if (remaining <= 0) {
      return 'Finalizada';
    }

    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);

    return `${hours}h ${minutes}m`;
  }

  // Método para finalizar la subasta y generar el botón de pago si es el ganador
  finalizeAuction() {
    this.auctions.forEach(async (auction) => {
      if (auction.isActive && this.getRemainingTime(auction.createdAt, auction.duration) === 'Finalizada') {
        await this.firestoreService.updateAuction(auction.id, { isActive: false });

        if (auction.isWinningUser) {
          this.sendPaymentData(auction);
        }
      }
    });
  }

  // Cargar las subastas según la ciudad del usuario
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
                isWinningUser: auction.winningUserId === user.id
              }));
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
}
