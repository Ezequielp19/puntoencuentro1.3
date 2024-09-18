import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/common/services/auth.service';
import { User } from 'src/app/common/models/users.models';
import { IoniconsModule } from '../../common/modules/ionicons.module';
import {
  IonItem, IonButton, IonLabel, IonInput, IonContent, IonGrid, IonRow, IonCol,
  IonCard, IonCardHeader, IonCardTitle, IonList, IonCardContent, IonToolbar,
  IonTitle, IonHeader, IonBackButton, IonButtons, IonSpinner, IonSelectOption,
  IonSelect, IonAvatar, IonMenu, IonMenuToggle, IonSplitPane, IonIcon, IonRouterOutlet, IonMenuButton, MenuController
} from '@ionic/angular/standalone';

import { FirestoreService } from 'src/app/common/services/firestore.service'; // Asegúrate de importar el servicio

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterModule, IoniconsModule,
    IonAvatar, IonSpinner, IonButtons, IonBackButton, IonHeader, IonTitle, IonToolbar,
    IonItem, IonInput, IonLabel, IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardHeader,
    IonCardTitle, IonList, IonCardContent, IonSelectOption, IonSelect, IonButton, IonAvatar,
    IonMenu, IonMenuToggle, IonIcon, IonRouterOutlet, IonSplitPane, IonMenuButton
  ],
})
export class ProfileComponent implements OnInit {

  userType: string = '';
  selectedOption: string;
  user: User | null = null;
  hasService: boolean = false;

  constructor(
    private authService: AuthService,
    private firestoreService: FirestoreService, // Agregado
    private router: Router,
    private menuCtrl: MenuController
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.user = user;
        this.checkUserServiceStatus(); // Verificar el estado del servicio del usuario
      } else {
        console.error('No se encontró el usuario');
      }
      console.log(this.user);
    });
  }

  async checkUserServiceStatus() {
    if (this.user) {
      this.hasService = await this.firestoreService.userHasService(this.user.id); // Asegúrate de pasar el ID correcto del usuario
    }
  }

  selectOption(option: string) {
    this.selectedOption = option;
    this.menuCtrl.close();  // Cerrar el menú después de seleccionar una opción
  }

  logout() {
    this.authService.logout().then(() => {
      localStorage.removeItem('currentUser');
      this.router.navigate(['/login']);
    }).catch(error => {
      console.error('Error durante el cierre de sesión:', error);
    });
  }
}
