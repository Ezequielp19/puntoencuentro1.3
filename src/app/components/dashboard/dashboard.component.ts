import {
  Component,
  OnInit,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonMenuButton
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import {IonRouterOutlet} from '@ionic/angular'
import { Citas } from 'src/app/common/models/cita.model';
import { Reviews } from 'src/app/common/models/reviews.model';
import { FirestoreService } from 'src/app/common/services/firestore.service';
import { AuthService } from 'src/app/common/services/auth.service';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
    IonMenuButton,
    CommonModule,
    RouterModule
  ],
})
export class DashboardComponent implements OnInit {

  resumenActividad: { nuevasCitas: number, calificacionPromedio: number } | undefined;
  proximasCitas: Citas[] = [];
  resenasDelDia: Reviews[] = [];

  constructor(private firestoreService: FirestoreService,   private router: Router,
    private authService: AuthService,
  ) { }

  async ngOnInit() {
    this.resumenActividad = await this.firestoreService.getResumenActividad();
    this.proximasCitas = await this.firestoreService.getProximasCitas();
    this.resenasDelDia = await this.firestoreService.getResenasDelDia();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
