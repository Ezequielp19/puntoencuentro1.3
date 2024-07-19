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

  IonTitle,
  IonHeader, IonBackButton, IonButtons, IonSpinner, IonSelectOption, IonSelect, IonAvatar } from '@ionic/angular/standalone';
import { Component, OnInit, Input } from '@angular/core';
import { FirestoreService } from '../../common/services/firestore.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { User } from 'src/app/common/models/users.models';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/common/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
standalone: true,
  imports: [IonAvatar, IonSpinner, IonButtons, IonBackButton,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonInput,
    IonLabel,
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
    IonButton,
    IonAvatar

  ],
})
export class RegisterComponent   {

   email: string = '';
  password: string = '';
  nombre: string = '';
  tipo_usuario: 'cliente' | 'proveedor' = 'cliente'; // Valor por defecto


  registerForm: FormGroup;

constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
  ) { }


async register() {
  try {
    // Eliminar espacios en blanco del correo electrónico
    this.email = this.email.trim();

    // Log del correo electrónico para depuración
    // console.log('Intentando registrar con el correo:', this.email);

    // Llamar al método de registro del servicio de autenticación
    await this.authService.register(this.email, this.password, this.nombre, this.tipo_usuario);

    // Navegar a la página de inicio tras un registro exitoso
    this.router.navigate(['/login']);
  } catch (error) {
    // Mostrar alerta de error en caso de falla
    const alert = await this.alertController.create({
      header: 'Registro Fallido',
      message: 'Error en el registro: ',
      buttons: ['OK']
    });
    await alert.present();
  }
}


irAlogin(){  this.router.navigate(['/login']);}

}
