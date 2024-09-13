import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../common/services/auth.service';
import {  AlertController,IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonTitle, IonToolbar, LoadingController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonButtons,
    IonToolbar,
    IonBackButton,
    IonTitle,
    IonInput,
    IonContent,
    IonItem,
    IonLabel,
    IonButton,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ResetPasswordComponent  implements OnInit {

 email: string = '';

  constructor(
    private authService: AuthService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

 ngOnInit(): void {
    console.log('ResetPasswordComponent initialized');
  }

  async resetPassword() {
    console.log("1");

    if (!this.email) {
      console.error("El campo de correo electrónico está vacío.");
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Por favor, ingresa un correo electrónico válido.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Por favor espera...',
      duration: 5000
    });
    console.log("2");
    await loading.present();
    console.log("2.5");
    try {
      console.log("3");
      await this.authService.resetPassword(this.email);
      await loading.dismiss();
      const alert = await this.alertController.create({
        header: 'Correo enviado',
        message: 'Revisa tu bandeja de entrada para restablecer tu contraseña.',
        buttons: ['OK']
      });
      await alert.present();
    } catch (error) {
      console.error("Error in resetPassword:", error);
      await loading.dismiss();
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Hubo un problema al intentar restablecer tu contraseña. Por favor, intenta de nuevo.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }
}
