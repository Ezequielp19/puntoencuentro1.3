import { AlertController, IonHeader, IonToolbar, IonButtons, IonButton, IonMenuButton, IonTitle, IonIcon, IonContent, IonCard, IonList, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/angular/standalone';
import { Component, OnInit } from '@angular/core';
import { FirestoreService } from 'src/app/common/services/firestore.service';
import { Observable } from 'rxjs';
import { Reviews } from 'src/app/common/models/reviews.model';
import { AuthService } from 'src/app/common/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-historial-resenas',
  templateUrl: './historial-resenas.component.html',
  styleUrls: ['./historial-resenas.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar,IonHeader,IonButtons,IonButton,IonMenuButton,IonTitle,IonIcon,IonContent
    ,IonCard,IonList,IonCardContent,IonCardHeader,IonCardTitle
  ]
})
export class HistorialResenasComponent implements OnInit {
  resenas$: Observable<Reviews[]>;
  resenas: Reviews[] = [];
  pagedResenas: Reviews[][] = [];
  currentPage: number = 0;
  userId: string;
  userType: string;

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userId = user.id;
        this.userType = user.tipo_usuario;
        this.loadReviews();
      } else {
        console.error('No se pudo obtener el usuario actual.');
      }
    });
  }

  ionViewWillEnter() {
    if (this.resenas.length === 0) {
      this.presentNoReviewsAlert();
    }
  }

  async loadReviews() {
    try {
      let resenas: Reviews[] = [];
      if (this.userType === 'cliente') {
        resenas = await this.firestoreService.getReviewsByClientId(this.userId);
      } else if (this.userType === 'proveedor') {
        resenas = await this.firestoreService.getReviewsByProviderId(this.userId);
      }
      this.resenas = resenas;
      this.paginateResenas();
    } catch (error) {
      console.error('Error cargando reseñas:', error);
    }
  }

  async presentNoReviewsAlert() {
    const message = this.userType === 'cliente'
      ? 'No tienes reseñas de servicios.'
      : 'No tienes reseñas de clientes.';
    const alert = await this.alertController.create({
      header: 'Sin reseñas',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  createRange(num: number) {
    return new Array(num);
  }

  async deleteReview(reviewId: string) {
    try {
      console.log(reviewId);
      await this.firestoreService.deleteReview(reviewId);
      await this.loadReviews(); // Wait for reviews to reload
    } catch (error) {
      console.error('Error eliminando reseña:', error);
    }
  }

  paginateResenas() {
    const resenasPerPage = 3;
    this.pagedResenas = [];
    for (let i = 0; i < this.resenas.length; i += resenasPerPage) {
      this.pagedResenas.push(this.resenas.slice(i, i + resenasPerPage));
    }
  }

  nextPage() {
    if (this.currentPage < this.pagedResenas.length - 1) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
