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

  constructor(private authService: AuthService, private router: Router, private menuCtrl: MenuController) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.user = user;
      } else {
        // Manejar el caso donde el usuario no existe
        console.error('No se encontró el usuario');
      }
      console.log(this.user);
    });
  }

  selectOption(option: string) {
    this.selectedOption = option;
    this.menuCtrl.close();  // Cerrar el menú después de seleccionar una opción
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
