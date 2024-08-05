import {
  IonItem,
  IonButton,
  IonLabel,
  IonInput,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonCardContent,
  IonToolbar,
  IonIcon,
  IonTitle,
  IonHeader, IonBackButton, IonButtons, IonSpinner, IonSelectOption, IonSelect, IonSegment, IonSegmentButton, IonImg, IonModal, IonPopover, IonFooter } from '@ionic/angular/standalone';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FirestoreService } from '../../common/services/firestore.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../common/services/auth.service';
import { AlertController  } from '@ionic/angular';
import { User } from 'src/app/common/models/users.models';
import { IoniconsModule } from 'src/app/common/modules/ionicons.module';









@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [IonFooter, IonPopover, IonModal,
    IonImg, IonSegmentButton, IonSegment, IonSpinner, IonButtons, IonBackButton,
    IonHeader,
    IonTitle,
    IonIcon,
    IonToolbar,
    IonItem,
    IonInput,
    IonLabel,
    IoniconsModule,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonList,
    IonCardContent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonSelectOption,
    IonSelect,
    IonButton
  ],
})
export class LoginComponent {

  email: string;
  password: string;

   showPassword: boolean = false;


  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  constructor(
    private authService: AuthService,
    private firestoreService: FirestoreService,
    private router: Router,
    private alertController: AlertController,



  ) { }



  async login() {
    try {
      const userCredential = await this.authService.login(this.email, this.password);
      const user = await this.firestoreService.getUserByEmail(this.email);
      this.redirectUser(user);
    } catch (error) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Password o Email incorrectos',
        buttons: ['OK']
      });
      await alert.present();
    }
  }




  async loginWithGoogle() {
    try {
      const userCredential = await this.authService.loginWithGoogle();
      const user = await this.firestoreService.getUserByEmail(userCredential.user.email);
      this.redirectUser(user);
      await this.showAlert('Éxito', 'Inicio de sesión con Google exitoso');
    } catch (error) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Credenciales incorrectas',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async loginWithFacebook() {
    try {
      const userCredential = await this.authService.loginWithFacebook();
      const user = await this.firestoreService.getUserByEmail(userCredential.user.email);
      this.redirectUser(user);
      await this.showAlert('Éxito', 'Inicio de sesión con Facebook exitoso');
    } catch (error) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Credenciales incorrectas',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  redirectUser(user: User) {
    if (user) {
      if (!user.tipo_usuario) {
        // Si el usuario no tiene tipo de usuario asignado, redirigir a la selección de tipo de usuario
        this.router.navigate(['/tipoUsuario']);
      } else {
        // Redirigir según el tipo de usuario
        switch (user.tipo_usuario) {
          case 'cliente':
            this.router.navigate(['/homeCliente']);
            break;
          case 'proveedor':
            this.router.navigate(['/perfil']);
            break;
          case 'admin':
            this.router.navigate(['/perfil/verServicios']);
            break;
          default:
            this.showAlert('Error', 'Tipo de usuario desconocido');
        }
      }
    } else {
      this.showAlert('Error', 'Usuario no encontrado');
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  goToResetPassword() {
    this.router.navigate(['/reset-password']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToPassword() {
    this.router.navigate(['/recuperarPassword']);
  }

  goToEmail() {
    this.router.navigate(['/recuperarEmail']);
  }





}
