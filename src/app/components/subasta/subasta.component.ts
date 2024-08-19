import { IonicModule } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/common/services/auth.service';
import { FirestoreService } from 'src/app/common/services/firestore.service';
import { Auction } from '../../common/models/subasta.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { Observable } from 'rxjs';

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
  newBidAmount: number = 0; // Variable to store the new bid amount

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserCityAndAuctions();
  }

  loadUserCityAndAuctions() {
    this.authService.getCurrentUser().subscribe(async user => {
      if (user) {
        try {
          const userService = await this.firestoreService.getServiceByUserId(user.id);
          if (userService) {
            this.userCity = userService.ciudad;
            // Usar observables para obtener las subastas en tiempo real
            this.firestoreService.getAuctionsByCity(this.userCity).subscribe((auctions: Auction[]) => {
              this.auctions = auctions;
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

  getRemainingTime(startTime: Date, duration: number): string {
    const now = new Date().getTime();
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

  async placeBid(auction: Auction) {
    try {
      console.log("1");
      this.authService.getCurrentUser().subscribe(currentUser => {
        console.log(currentUser);
        if (currentUser && this.newBidAmount > auction.currentWinningPrice) {
          this.firestoreService.updateAuction(auction.id, {
            currentWinningPrice: this.newBidAmount,
            winningUserId: currentUser.id
          }).then(() => {
            console.log("2");
          }).catch(error => {
            console.error('Error al actualizar la subasta:', error);
          });
        } else {
          console.error('El monto de la puja debe ser mayor al monto actual.');
        }
      }, error => {
        console.error('Error al obtener el usuario actual:', error);
      });
    } catch (error) {
      console.error('Error al realizar la puja:', error);
    }
  }


  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
